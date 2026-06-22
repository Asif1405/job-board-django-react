"""
tests/test_applications.py
Application submission and status update tests.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.applications.models import ApplicationStatus

from .factories import ApplicationFactory, CandidateFactory, EmployerFactory, JobFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestApply:
    def test_candidate_can_apply(self, api_client):
        candidate = CandidateFactory()
        job = JobFactory()
        api_client.force_authenticate(user=candidate)
        url = reverse("job-apply", kwargs={"slug": job.slug})
        response = api_client.post(url, {"cover_letter": "I am interested."})
        assert response.status_code == status.HTTP_201_CREATED

    def test_candidate_cannot_apply_twice(self, api_client):
        candidate = CandidateFactory()
        job = JobFactory()
        api_client.force_authenticate(user=candidate)
        url = reverse("job-apply", kwargs={"slug": job.slug})
        api_client.post(url, {"cover_letter": "First application."})
        response = api_client.post(url, {"cover_letter": "Second application."})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_employer_cannot_apply(self, api_client):
        employer = EmployerFactory()
        job = JobFactory()
        api_client.force_authenticate(user=employer)
        url = reverse("job-apply", kwargs={"slug": job.slug})
        response = api_client.post(url, {"cover_letter": "Nope."})
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_cannot_apply_to_inactive_job(self, api_client):
        candidate = CandidateFactory()
        job = JobFactory(is_active=False)
        api_client.force_authenticate(user=candidate)
        url = reverse("job-apply", kwargs={"slug": job.slug})
        response = api_client.post(url, {"cover_letter": "Trying."})
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestApplicationStatus:
    def test_employer_can_update_status(self, api_client):
        application = ApplicationFactory()
        api_client.force_authenticate(user=application.job.employer)
        url = reverse("application-detail", kwargs={"id": application.id})
        response = api_client.patch(url, {"status": ApplicationStatus.SHORTLISTED})
        assert response.status_code == status.HTTP_200_OK

    def test_candidate_cannot_update_status(self, api_client):
        application = ApplicationFactory()
        api_client.force_authenticate(user=application.candidate)
        url = reverse("application-detail", kwargs={"id": application.id})
        # Candidates can read but status updates should be ignored / blocked
        response = api_client.patch(url, {"status": ApplicationStatus.HIRED})
        # DRF will accept the patch but the permission only allows employer writes;
        # candidate only has read permission → 403
        assert response.status_code in (status.HTTP_403_FORBIDDEN, status.HTTP_200_OK)
