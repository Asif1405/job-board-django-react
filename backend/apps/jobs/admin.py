"""
jobs/admin.py
"""
from django.contrib import admin

from .models import Category, Job, Tag


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ["name"]
    search_fields = ["name"]


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ["title", "employer", "job_type", "location", "is_active", "created_at"]
    list_filter = ["job_type", "is_active", "category"]
    search_fields = ["title", "employer__email", "location"]
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ["id", "created_at", "updated_at"]
    filter_horizontal = ["tags"]
