from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Project


User = get_user_model()


class ProjectAPITests(APITestCase):

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

    def authenticate(self, user):
        refresh = RefreshToken.for_user(user)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}"
        )

    def test_authenticated_user_can_list_own_projects(self):
        self.authenticate(self.user)

        response = self.client.get("/api/projects/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.project.id)

    def test_user_cannot_see_other_users_projects(self):
        self.authenticate(self.other_user)

        response = self.client.get("/api/projects/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_authenticated_user_can_create_project(self):
        self.authenticate(self.user)

        response = self.client.post(
            "/api/projects/",
            {
                "name": "New Project",
                "description": "Created by API test",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        project = Project.objects.get(id=response.data["id"])

        self.assertEqual(project.owner, self.user)

    def test_user_cannot_modify_other_users_project(self):
        self.authenticate(self.other_user)

        response = self.client.patch(
            f"/api/projects/{self.project.id}/",
            {
                "name": "Hacked Project",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.project.refresh_from_db()

        self.assertEqual(
            self.project.name,
            "Garow SaaS Demo",
        )

    def test_user_cannot_delete_other_users_project(self):
        self.authenticate(self.other_user)

        response = self.client.delete(
            f"/api/projects/{self.project.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            Project.objects.filter(id=self.project.id).exists()
        )