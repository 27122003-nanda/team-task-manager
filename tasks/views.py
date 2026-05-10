from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from tasks.models import Task
from tasks.serializers import TaskSerializer
from projects.models import Project, Membership
from django.utils import timezone


def get_role(user, project):
    try:
        return Membership.objects.get(user=user, project=project).role
    except Membership.DoesNotExist:
        return None


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_project(self):
        try:
            return Project.objects.get(pk=self.kwargs['project_pk'])
        except Project.DoesNotExist:
            return None

    def get_queryset(self):
        project = self.get_project()
        if not project:
            return Task.objects.none()
        role = get_role(self.request.user, project)
        if not role:
            return Task.objects.none()
        return Task.objects.filter(project=project)

    def perform_create(self, serializer):
        project = self.get_project()
        role = get_role(self.request.user, project)
        if not role:
            raise PermissionError('You are not a member of this project.')
        serializer.save(project=project)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.all()

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        role = get_role(request.user, task.project)
        if not role:
            return Response({'error': 'Not a member.'}, status=403)
        if role == Membership.MEMBER:
            allowed_fields = {'status'}
            requested_fields = set(request.data.keys())
            if not requested_fields.issubset(allowed_fields):
                return Response(
                    {'error': 'Members can only update task status.'},
                    status=403
                )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        role = get_role(request.user, task.project)
        if role != Membership.ADMIN:
            return Response({'error': 'Only admins can delete tasks.'}, status=403)
        return super().destroy(request, *args, **kwargs)


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        memberships = Membership.objects.filter(user=request.user)
        project_ids = memberships.values_list('project_id', flat=True)
        tasks = Task.objects.filter(project_id__in=project_ids)

        today = timezone.now().date()
        overdue = tasks.filter(due_date__lt=today).exclude(status=Task.DONE)

        return Response({
            'total': tasks.count(),
            'todo': tasks.filter(status=Task.TODO).count(),
            'in_progress': tasks.filter(status=Task.IN_PROGRESS).count(),
            'done': tasks.filter(status=Task.DONE).count(),
            'overdue': tasks.filter(due_date__lt=today).exclude(status=Task.DONE).count(),
            'overdue_tasks': TaskSerializer(overdue, many=True).data,
        })

