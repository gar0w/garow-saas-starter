from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from projects.models import Project
from .models import Task


User = get_user_model()


class TaskAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="garow",
            email="garow@example.com",
            password="TestPassword123!",
        )

        self.other_user = User.objects.create_user(
            username="tester",
            email="tester@example.com",
            password="TestPassword123!",
        )

        self.project = Project.objects.create(
            owner=self.user,
            name="Garow SaaS Demo",
            description="Test project",
        )

        self.other_project = Project.objects.create(
            owner=self.other_user,
            name="Tester Project",
            description="Other user's project",
        )

        self.task = Task.objects.create(
            project=self.project,
            created_by=self.user,
            title="Create landing page",
            description="Build the landing page",
            status=Task.Status.TODO,
        )

    def authenticate(self, user):
        refresh = RefreshToken.for_user(user)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}"
        )

    def test_user_can_list_own_tasks(self):
        self.authenticate(self.user)

        response = self.client.get("/api/tasks/")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["id"],
            self.task.id,
        )

    def test_user_can_create_task_in_own_project(self):
        self.authenticate(self.user)

        response = self.client.post(
            "/api/tasks/",
            {
                "project": self.project.id,
                "title": "Create dashboard",
                "description": "Build the dashboard",
                "status": "TODO",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        task = Task.objects.get(
            id=response.data["id"]
        )

        self.assertEqual(
            task.created_by,
            self.user,
        )

        self.assertEqual(
            task.project,
            self.project,
        )

    def test_user_cannot_create_task_in_other_users_project(self):
        self.authenticate(self.other_user)

        response = self.client.post(
            "/api/tasks/",
            {
                "project": self.project.id,
                "title": "Unauthorized task",
                "description": "This should fail",
                "status": "TODO",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "project",
            response.data,
        )

        self.assertEqual(
            Task.objects.filter(
                title="Unauthorized task"
            ).count(),
            0,
        )

    def test_user_cannot_see_other_users_tasks(self):
        self.authenticate(self.other_user)

        response = self.client.get(
            "/api/tasks/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            0,
        )

    def test_user_cannot_modify_other_users_task(self):
        self.authenticate(self.other_user)

        response = self.client.patch(
            f"/api/tasks/{self.task.id}/",
            {
                "title": "Hacked task",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.task.refresh_from_db()

        self.assertEqual(
            self.task.title,
            "Create landing page",
        )

    def test_user_cannot_delete_other_users_task(self):
        self.authenticate(self.other_user)

        response = self.client.delete(
            f"/api/tasks/{self.task.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            Task.objects.filter(
                id=self.task.id
            ).exists()
        )

    def test_unauthenticated_user_cannot_access_tasks(self):
        response = self.client.get(
            "/api/tasks/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )