"""
accounts/permissions.py
Custom DRF permission classes for role-based access control.
"""
from rest_framework.permissions import BasePermission, IsAuthenticated


class IsEmployer(BasePermission):
    """Allow access only to users with role=employer."""
    message = "Only employers can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_employer
        )


class IsCandidate(BasePermission):
    """Allow access only to users with role=candidate."""
    message = "Only candidates can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_candidate
        )


class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission: allow write access only to the owner of an object.
    Assumes the model instance has an `employer` or `candidate` attribute that
    points to a CustomUser.
    """
    def has_object_permission(self, request, view, obj):
        # SAFE_METHODS = GET, HEAD, OPTIONS
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        # Check owner: jobs use `employer`, applications use `candidate`
        owner = getattr(obj, "employer", None) or getattr(obj, "candidate", None)
        return owner == request.user


class IsJobOwner(BasePermission):
    """Employer must be the owner of the job to modify it."""
    message = "You do not own this job listing."

    def has_object_permission(self, request, view, obj):
        return obj.employer == request.user


class IsApplicationOwnerOrJobOwner(BasePermission):
    """
    Candidates can read/update their own application.
    The employer who owns the job can also read and update the application status.
    """
    message = "You do not have permission to access this application."

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Candidate who submitted it
        if obj.candidate == user:
            return True
        # Employer who owns the associated job
        if obj.job.employer == user:
            return True
        return False
