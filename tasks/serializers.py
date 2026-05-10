from rest_framework import serializers
from tasks.models import Task
from accounts.serializers import UserSerializer


class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    assignee_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'project',
            'assignee', 'assignee_id', 'status', 'priority',
            'due_date', 'created_at'
        ]
        read_only_fields = ['project', 'created_at']

