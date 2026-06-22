"""
jobs/filters.py
django-filter FilterSet for Job search/filtering.
"""
import django_filters

from .models import Job, JobType


class JobFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug", lookup_expr="iexact")
    job_type = django_filters.ChoiceFilter(choices=JobType.choices)
    location = django_filters.CharFilter(field_name="location", lookup_expr="icontains")
    salary_min = django_filters.NumberFilter(field_name="salary_min", lookup_expr="gte")
    salary_max = django_filters.NumberFilter(field_name="salary_max", lookup_expr="lte")
    is_active = django_filters.BooleanFilter(field_name="is_active")
    tags = django_filters.CharFilter(field_name="tags__name", lookup_expr="icontains")

    class Meta:
        model = Job
        fields = ["category", "job_type", "location", "salary_min", "salary_max", "is_active"]
