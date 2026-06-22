"""
applications/views.py
"""
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsApplicationOwnerOrJobOwner, IsCandidate, IsEmployer
from apps.jobs.models import Job

from .models import Application
from .serializers import (
    ApplicationCreateSerializer,
    ApplicationSerializer,
    ApplicationStatusUpdateSerializer,
)


# ─── Apply to a job ───────────────────────────────────────────────────────────

class ApplyToJobView(APIView):
    """POST /api/v1/jobs/:slug/apply/ — candidate submits an application."""
    permission_classes = [IsCandidate]

    def post(self, request, slug: str):
        job = get_object_or_404(Job, slug=slug)
        serializer = ApplicationCreateSerializer(
            data=request.data,
            context={"request": request, "job": job},
        )
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        return Response(
            ApplicationSerializer(application).data,
            status=status.HTTP_201_CREATED,
        )


# ─── Candidate: my applications ───────────────────────────────────────────────

class MyApplicationListView(generics.ListAPIView):
    """GET /api/v1/applications/ — candidate's own submitted applications."""
    serializer_class = ApplicationSerializer
    permission_classes = [IsCandidate]

    def get_queryset(self):
        return (
            Application.objects.filter(candidate=self.request.user)
            .select_related("job", "job__employer", "job__employer__employer_profile")
            .order_by("-created_at")
        )


# ─── Employer: applications for one of their jobs ─────────────────────────────

class JobApplicationListView(generics.ListAPIView):
    """GET /api/v1/jobs/:slug/applications/ — employer views applicants."""
    serializer_class = ApplicationSerializer
    permission_classes = [IsEmployer]

    def get_queryset(self):
        job = get_object_or_404(Job, slug=self.kwargs["slug"], employer=self.request.user)
        return (
            Application.objects.filter(job=job)
            .select_related("candidate", "candidate__candidate_profile")
            .order_by("-created_at")
        )


# ─── Application Detail (status update) ──────────────────────────────────────

class ApplicationDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/v1/applications/:id/ — candidate or job-owner employer
    PATCH /api/v1/applications/:id/ — employer updates status
    """
    queryset = Application.objects.select_related(
        "job",
        "job__employer",
        "candidate",
        "candidate__candidate_profile",
    )
    permission_classes = [permissions.IsAuthenticated, IsApplicationOwnerOrJobOwner]
    lookup_field = "id"

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ApplicationStatusUpdateSerializer
        return ApplicationSerializer
