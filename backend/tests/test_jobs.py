"""
tests/test_jobs.py
Job CRUD endpoint tests.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .factories import CandidateFactory, EmployerFactory, JobFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestJobList:
    def test_public_can_list_jobs(self, api_client):
        JobFactory.create_batch(3)
        url = reverse("job-list-create")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] >= 3

    def test_only_active_jobs_in_public_list(self, api_client):
        JobFactory(is_active=True)
        JobFactory(is_active=False)
        url = reverse("job-list-create")
        response = api_client.get(url)
        for result in response.data["results"]:
            assert result["is_active"] is True


@pytest.mark.django_db
class TestJobCreate:
    def test_employer_can_create_job(self, api_client):
        employer = EmployerFactory()
        api_client.force_authenticate(user=employer)
        url = reverse("job-list-create")
        data = {
            "title": "Senior Python Developer",
            "job_type": "full_time",
            "location": "Remote",
            "description": "We need a Python dev.",
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED

    def test_candidate_cannot_create_job(self, api_client):
        candidate = CandidateFactory()
        api_client.force_authenticate(user=candidate)
        url = reverse("job-list-create")
        data = {"title": "Test", "job_type": "full_time", "location": "NYC", "description": "x"}
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_create_job(self, api_client):
        url = reverse("job-list-create")
        data = {"title": "Test", "job_type": "full_time", "location": "NYC", "description": "x"}
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestJobDetail:
    def test_public_can_retrieve_job(self, api_client):
        job = JobFactory()
        url = reverse("job-detail", kwargs={"slug": job.slug})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["slug"] == job.slug

    def test_owner_can_update_job(self, api_client):
        job = JobFactory()
        api_client.force_authenticate(user=job.employer)
        url = reverse("job-detail", kwargs={"slug": job.slug})
        response = api_client.patch(url, {"title": "Updated Title"})
        assert response.status_code == status.HTTP_200_OK

    def test_non_owner_cannot_update_job(self, api_client):
        job = JobFactory()
        other_employer = EmployerFactory()
        api_client.force_authenticate(user=other_employer)
        url = reverse("job-detail", kwargs={"slug": job.slug})
        response = api_client.patch(url, {"title": "Hacked"})
        assert response.status_code == status.HTTP_403_FORBIDDEN
