"""
tests/test_accounts.py
Basic auth endpoint tests.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import CustomUser, Role

from .factories import CandidateFactory, EmployerFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def candidate(db):
    return CandidateFactory()


@pytest.fixture
def employer(db):
    return EmployerFactory()


@pytest.mark.django_db
class TestRegister:
    def test_candidate_registration(self, api_client):
        url = reverse("auth-register")
        data = {
            "email": "candidate@example.com",
            "full_name": "Jane Doe",
            "role": Role.CANDIDATE,
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert "access" in response.data
        assert CustomUser.objects.filter(email="candidate@example.com").exists()

    def test_employer_registration(self, api_client):
        url = reverse("auth-register")
        data = {
            "email": "employer@example.com",
            "full_name": "Acme Corp",
            "role": Role.EMPLOYER,
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        user = CustomUser.objects.get(email="employer@example.com")
        assert hasattr(user, "employer_profile")

    def test_password_mismatch(self, api_client):
        url = reverse("auth-register")
        data = {
            "email": "bad@example.com",
            "full_name": "Bad User",
            "role": Role.CANDIDATE,
            "password": "StrongPass123!",
            "password2": "WrongPass456!",
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogin:
    def test_login_returns_tokens(self, api_client, candidate):
        url = reverse("auth-login")
        response = api_client.post(url, {"email": candidate.email, "password": "testpass123"})
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data

    def test_invalid_credentials(self, api_client, candidate):
        url = reverse("auth-login")
        response = api_client.post(url, {"email": candidate.email, "password": "wrongpassword"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestMe:
    def test_me_returns_current_user(self, api_client, candidate):
        api_client.force_authenticate(user=candidate)
        url = reverse("auth-me")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == candidate.email

    def test_me_requires_authentication(self, api_client):
        url = reverse("auth-me")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
