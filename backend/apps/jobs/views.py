"""
jobs/views.py
"""
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsEmployer, IsJobOwner

from .filters import JobFilter
from .models import Category, Job, Tag
from .serializers import (
    CategorySerializer,
    JobDetailSerializer,
    JobListSerializer,
    JobWriteSerializer,
    TagSerializer,
)


# ─── Category & Tag (read-only reference endpoints) ──────────────────────────

class CategoryListView(generics.ListAPIView):
    """GET /api/v1/jobs/categories/"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class TagListView(generics.ListAPIView):
    """GET /api/v1/jobs/tags/"""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


# ─── Job List / Create ────────────────────────────────────────────────────────

class JobListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/jobs/        — public, paginated, filterable
    POST /api/v1/jobs/        — employer only
    """
    filterset_class = JobFilter
    search_fields = ["title", "description", "location"]
    ordering_fields = ["created_at", "salary_min", "salary_max"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = (
            Job.objects.select_related("employer", "employer__employer_profile", "category")
            .prefetch_related("tags")
        )
        # Public list: only active jobs; employers can see their own inactive ones
        if self.request.user.is_authenticated and self.request.user.is_employer:
            return qs
        return qs.filter(is_active=True)

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsEmployer()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return JobWriteSerializer
        return JobListSerializer

    def perform_create(self, serializer):
        serializer.save(employer=self.request.user)


# ─── Job Detail / Update / Delete ────────────────────────────────────────────

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/jobs/:slug/   — public
    PUT    /api/v1/jobs/:slug/   — owner employer
    PATCH  /api/v1/jobs/:slug/   — owner employer
    DELETE /api/v1/jobs/:slug/   — owner employer
    """
    queryset = Job.objects.select_related(
        "employer", "employer__employer_profile", "category"
    ).prefetch_related("tags", "applications")
    lookup_field = "slug"

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsJobOwner()]

    def get_serializer_class(self):
        if self.request.method in permissions.SAFE_METHODS:
            return JobDetailSerializer
        return JobWriteSerializer


# ─── My Jobs (employer) ───────────────────────────────────────────────────────

class MyJobListView(generics.ListAPIView):
    """GET /api/v1/jobs/my/ — employer's own job listings."""
    serializer_class = JobListSerializer
    permission_classes = [IsEmployer]

    def get_queryset(self):
        return (
            Job.objects.filter(employer=self.request.user)
            .select_related("category")
            .prefetch_related("tags")
            .order_by("-created_at")
        )
