projects_urls = """from django.urls import path
from projects.views import ProjectListCreateView, ProjectDetailView, InviteMemberView

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project-list'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('<int:pk>/invite/', InviteMemberView.as_view(), name='project-invite'),
]
"""

tasks_urls = """from django.urls import path
from tasks.views import TaskListCreateView, TaskDetailView, DashboardView

urlpatterns = [
    path('projects/<int:project_pk>/tasks/', TaskListCreateView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]
"""

with open('projects/urls.py', 'w') as f:
    f.write(projects_urls)

with open('tasks/urls.py', 'w') as f:
    f.write(tasks_urls)

print("Done! Both files written.")