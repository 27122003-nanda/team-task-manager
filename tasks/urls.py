from django.urls import path
from tasks.views import TaskListCreateView, TaskDetailView, DashboardView

urlpatterns = [
    path('projects/<int:project_pk>/tasks/', TaskListCreateView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]

