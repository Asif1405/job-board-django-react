"""
accounts/models.py
Custom user model + Employer/Candidate profiles.
"""
import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class Role(models.TextChoices):
    CANDIDATE = "candidate", "Candidate"
    EMPLOYER = "employer", "Employer"


# ─── Custom User Manager ──────────────────────────────────────────────────────

class CustomUserManager(BaseUserManager):
    def create_user(self, email: str, password: str | None = None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set.")
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", Role.EMPLOYER)

        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


# ─── Custom User ──────────────────────────────────────────────────────────────

class CustomUser(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CANDIDATE)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name", "role"]

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.full_name} <{self.email}>"

    @property
    def is_employer(self) -> bool:
        return self.role == Role.EMPLOYER

    @property
    def is_candidate(self) -> bool:
        return self.role == Role.CANDIDATE


# ─── Employer Profile ─────────────────────────────────────────────────────────

class EmployerProfile(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="employer_profile",
        limit_choices_to={"role": Role.EMPLOYER},
    )
    company_name = models.CharField(max_length=255)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to="employer_logos/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Employer Profile"
        verbose_name_plural = "Employer Profiles"

    def __str__(self) -> str:
        return self.company_name


# ─── Candidate Profile ────────────────────────────────────────────────────────

class CandidateProfile(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="candidate_profile",
        limit_choices_to={"role": Role.CANDIDATE},
    )
    headline = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)
    location = models.CharField(max_length=255, blank=True)
    linkedin_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Candidate Profile"
        verbose_name_plural = "Candidate Profiles"

    def __str__(self) -> str:
        return f"{self.user.full_name} — {self.headline}"
