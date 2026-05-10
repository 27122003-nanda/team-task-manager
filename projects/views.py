from rest_framework import generics, permissions, status

from rest_framework.response import Response
from rest_framework.views import APIView
from projects.models import Project, Membership
from projects.serializers import ProjectSerializer, InviteSerializer
from accounts.models import User


def get_role(user, project):
    try:
        return Membership.objects.get(user=user, project=project).role
    except Membership.DoesNotExist:
        return None


class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        memberships = Membership.objects.filter(user=self.request.user)
        project_ids = memberships.values_list('project_id', flat=True)
        return Project.objects.filter(id__in=project_ids)

    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        Membership.objects.create(
            user=self.request.user,
            project=project,
            role=Membership.ADMIN
        )


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        memberships = Membership.objects.filter(user=self.request.user)
        project_ids = memberships.values_list('project_id', flat=True)
        return Project.objects.filter(id__in=project_ids)

    def destroy(self, request, *args, **kwargs):
        project = self.get_object()
        role = get_role(request.user, project)
        if role != Membership.ADMIN:
            return Response({'error': 'Only admins can delete projects.'}, status=403)
        return super().destroy(request, *args, **kwargs)


class InviteMemberView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=404)

        role = get_role(request.user, project)
        if role != Membership.ADMIN:
            return Response({'error': 'Only admins can invite members.'}, status=403)

        serializer = InviteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data['email']
        invite_role = serializer.validated_data['role']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'No user found with that email.'}, status=404)

        membership, created = Membership.objects.get_or_create(
            user=user,
            project=project,
            defaults={'role': invite_role}
        )

        if not created:
            return Response({'error': 'User is already a member.'}, status=400)

        return Response({'message': f'{email} added as {invite_role}.'}, status=201)

