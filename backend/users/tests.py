from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


class UserAPITests(APITestCase):
	def test_user_can_register_with_hashed_password(self):
		response = self.client.post(
			"/api/auth/register/",
			{
				"username": "new-user",
				"email": "new@example.com",
				"password": "StrongPassword123!",
			},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		user = User.objects.get(username="new-user")
		self.assertTrue(user.check_password("StrongPassword123!"))
		self.assertNotEqual(user.password, "StrongPassword123!")

	def test_login_returns_access_and_refresh_tokens(self):
		User.objects.create_user(
			username="garow",
			password="StrongPassword123!",
		)

		response = self.client.post(
			"/api/auth/login/",
			{"username": "garow", "password": "StrongPassword123!"},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn("access", response.data)
		self.assertIn("refresh", response.data)

	def test_logout_blacklists_refresh_token(self):
		user = User.objects.create_user(
			username="garow",
			password="StrongPassword123!",
		)
		refresh = RefreshToken.for_user(user)

		response = self.client.post(
			"/api/auth/logout/",
			{"refresh": str(refresh)},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

		with self.assertRaises(TokenError):
			RefreshToken(str(refresh))
