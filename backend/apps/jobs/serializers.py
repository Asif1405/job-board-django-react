"""
jobs/serializers.py
"""
from rest_framework import serializers

from apps.accounts.serializers import EmployerProfileSerializer

from .models import Category, Job, Tag


# ─── Category & Tag ───────────────────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


# ─── Job Serializers ──────────────────────────────────────────────────────────

class JobListSerializer(serializers.ModelSerializer):
    """Lightweight serializer used in list views."""
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    employer_name = serializers.CharField(
        source="employer.employer_profile.company_name",
        default="",
        read_only=True,
    )
    employer_logo = serializers.ImageField(
        source="employer.employer_profile.logo",
        default=None,
        read_only=True,
    )
    application_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id",
            "title",
            "slug",
            "employer_name",
            "employer_logo",
            "category",
            "tags",
            "job_type",
            "location",
            "salary_min",
            "salary_max",
            "is_active",
            "deadline",
            "created_at",
            "application_count",
        ]

    def get_application_count(self, obj) -> int:
        return obj.applications.count()


class JobDetailSerializer(JobListSerializer):
    """Full serializer with description + requirements."""
    employer_profile = EmployerProfileSerializer(
        source="employer.employer_profile",
        read_only=True,
    )

    class Meta(JobListSerializer.Meta):
        fields = JobListSerializer.Meta.fields + [
            "description",
            "requirements",
            "updated_at",
            "employer_profile",
        ]


class JobWriteSerializer(serializers.ModelSerializer):
    """Used for create / update — tags accepted as list of IDs."""
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, required=False
    )
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Job
        fields = [
            "title",
            "category",
            "tags",
            "job_type",
            "location",
            "salary_min",
            "salary_max",
            "description",
            "requirements",
            "is_active",
            "deadline",
        ]

    def validate(self, attrs):
        salary_min = attrs.get("salary_min")
        salary_max = attrs.get("salary_max")
        if salary_min and salary_max and salary_min > salary_max:
            raise serializers.ValidationError(
                {"salary_min": "salary_min must be less than or equal to salary_max."}
            )
        return attrs
