"""
applications/models.py
Job applications submitted by candidates.
"""
import uuid

from django.conf import settings
from django.db import models


class ApplicationStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    REVIEWING = "reviewing", "Reviewing"
    SHORTLISTED = "shortlisted", "Shortlisted"
    REJECTED = "rejected", "Rejected"
    HIRED = "hired", "Hired"


class Application(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(
        "jobs.Job",
        on_delete=models.CASCADE,
        related_name="applications",
    )
    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
        limit_choices_to={"role": "candidate"},
    )
    status = models.CharField(
        max_length=20,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.PENDING,
        db_index=True,
    )
    cover_letter = models.TextField(blank=True)
    # Snapshot of the resume at the time of applying (optional)
    resume_snapshot = models.FileField(
        upload_to="application_resumes/",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Application"
        verbose_name_plural = "Applications"
        ordering = ["-created_at"]
        # A candidate can only apply once per job
        constraints = [
            models.UniqueConstraint(
                fields=["job", "candidate"],
                name="unique_application_per_job",
            )
        ]

    def __str__(self) -> str:
        return f"{self.candidate} → {self.job} [{self.status}]"
