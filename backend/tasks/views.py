from rest_framework import viewsets

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.filter(
            created_by=self.request.user
        )

        project_id = self.request.query_params.get("project")
        
        if project_id:
            queryset = queryset.filter(
                project_id=project_id
            )

        status = self.request.query_params.get("status")
        priority = self.request.query_params.get("priority")
        ordering = self.request.query_params.get("ordering", "-created_at")

        if status:
            queryset = queryset.filter(status=status)

        if priority:
            queryset = queryset.filter(priority=priority)

        allowed_ordering = {
            "created_at",
            "-created_at",
            "due_date",
            "-due_date",
            "title",
            "-title",
        }

        if ordering in allowed_ordering:
            queryset = queryset.order_by(ordering)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user
        )