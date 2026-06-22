"""
applications/serializers.py
"""
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.jobs.serializers import JobListSerializer

from .models import Application, ApplicationStatus


class ApplicationSerializer(serializers.ModelSerializer):
    """Full read serializer — includes nested job and candidate info."""
    job = JobListSerializer(read_only=True)
    candidate = UserSerializer(read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "job",
            "candidate",
            "status",
            "cover_letter",
            "resume_snapshot",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "candidate", "created_at", "updated_at"]


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Used by candidates to submit an application."""

    class Meta:
        model = Application
        fields = ["cover_letter", "resume_snapshot"]

    def validate(self, attrs):
        request = self.context["request"]
        job = self.context["job"]

        # Prevent duplicate applications
        if Application.objects.filter(job=job, candidate=request.user).exists():
            raise serializers.ValidationError(
                "You have already applied for this job."
            )

        # Job must be active
        if not job.is_active:
            raise serializers.ValidationError("This job is no longer accepting applications.")

        return attrs

    def create(self, validated_data):
        return Application.objects.create(
            job=self.context["job"],
            candidate=self.context["request"].user,
            **validated_data,
        )


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """Used by employers to update application status."""

    class Meta:
        model = Application
        fields = ["status"]

    def validate_status(self, value):
        if value not in ApplicationStatus.values:
            raise serializers.ValidationError(f"Invalid status: {value}")
        return value
