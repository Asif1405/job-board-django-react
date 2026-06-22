"""
accounts/serializers.py
"""
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import CandidateProfile, CustomUser, EmployerProfile, Role


# ─── Profile Serializers ─────────────────────────────────────────────────────

class EmployerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployerProfile
        fields = ["company_name", "website", "description", "logo"]


class CandidateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = ["headline", "bio", "resume", "location", "linkedin_url"]


# ─── User Read Serializer ─────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    employer_profile = EmployerProfileSerializer(read_only=True)
    candidate_profile = CandidateProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "full_name",
            "role",
            "is_active",
            "created_at",
            "employer_profile",
            "candidate_profile",
        ]
        read_only_fields = ["id", "email", "role", "is_active", "created_at"]


# ─── Registration Serializer ──────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")

    class Meta:
        model = CustomUser
        fields = ["email", "full_name", "role", "password", "password2"]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        # Auto-create the corresponding profile
        if user.role == Role.EMPLOYER:
            EmployerProfile.objects.create(user=user, company_name=user.full_name)
        else:
            CandidateProfile.objects.create(user=user)
        return user


# ─── Me / Update Serializer ───────────────────────────────────────────────────

class UpdateUserSerializer(serializers.ModelSerializer):
    employer_profile = EmployerProfileSerializer(required=False)
    candidate_profile = CandidateProfileSerializer(required=False)

    class Meta:
        model = CustomUser
        fields = ["full_name", "employer_profile", "candidate_profile"]

    def update(self, instance, validated_data):
        employer_data = validated_data.pop("employer_profile", None)
        candidate_data = validated_data.pop("candidate_profile", None)

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update nested profile
        if employer_data and hasattr(instance, "employer_profile"):
            for attr, value in employer_data.items():
                setattr(instance.employer_profile, attr, value)
            instance.employer_profile.save()

        if candidate_data and hasattr(instance, "candidate_profile"):
            for attr, value in candidate_data.items():
                setattr(instance.candidate_profile, attr, value)
            instance.candidate_profile.save()

        return instance


# ─── Change Password Serializer ───────────────────────────────────────────────

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
