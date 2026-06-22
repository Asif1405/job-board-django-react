"""
jobs/models.py
Job listings, categories and tags.
"""
import uuid

from django.conf import settings
from django.db import models
from django.utils.text import slugify


# ─── Category ─────────────────────────────────────────────────────────────────

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=110, unique=True, blank=True)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


# ─── Tag ──────────────────────────────────────────────────────────────────────

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


# ─── Job ──────────────────────────────────────────────────────────────────────

class JobType(models.TextChoices):
    FULL_TIME = "full_time", "Full Time"
    PART_TIME = "part_time", "Part Time"
    CONTRACT = "contract", "Contract"
    INTERNSHIP = "internship", "Internship"
    REMOTE = "remote", "Remote"


class Job(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="jobs",
        limit_choices_to={"role": "employer"},
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="jobs",
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="jobs")
    job_type = models.CharField(
        max_length=20,
        choices=JobType.choices,
        default=JobType.FULL_TIME,
    )
    location = models.CharField(max_length=255)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(help_text="Supports Markdown")
    requirements = models.TextField(blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Job"
        verbose_name_plural = "Jobs"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            self.slug = base_slug
            # Ensure uniqueness
            counter = 1
            while Job.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{base_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.title} ({self.employer})"
