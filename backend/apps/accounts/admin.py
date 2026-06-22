"""
accounts/admin.py
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import CandidateProfile, CustomUser, EmployerProfile


class EmployerProfileInline(admin.StackedInline):
    model = EmployerProfile
    extra = 0


class CandidateProfileInline(admin.StackedInline):
    model = CandidateProfile
    extra = 0


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    ordering = ["-created_at"]
    list_display = ["email", "full_name", "role", "is_active", "is_staff", "created_at"]
    list_filter = ["role", "is_active", "is_staff"]
    search_fields = ["email", "full_name"]
    readonly_fields = ["id", "created_at", "updated_at"]
    inlines = [EmployerProfileInline, CandidateProfileInline]

    fieldsets = (
        (None, {"fields": ("id", "email", "password")}),
        ("Personal info", {"fields": ("full_name", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "full_name", "role", "password1", "password2"),
            },
        ),
    )


@admin.register(EmployerProfile)
class EmployerProfileAdmin(admin.ModelAdmin):
    list_display = ["company_name", "user", "website"]
    search_fields = ["company_name", "user__email"]


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "headline", "location"]
    search_fields = ["user__email", "user__full_name"]
