from django.urls import path
from projects.views import ProjectListCreateView, ProjectDetailView, InviteMemberView

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project-list'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('<int:pk>/invite/', InviteMemberView.as_view(), name='project-invite'),
]