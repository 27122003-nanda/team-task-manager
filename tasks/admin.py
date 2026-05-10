from django.contrib import admin
from tasks.models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'assignee', 'status', 'priority', 'due_date']
    list_filter = ['status', 'priority']
    search_fields = ['title']

