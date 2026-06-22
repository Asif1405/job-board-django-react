"""
accounts/views.py
Registration, JWT login/logout, and user profile management.
"""
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import (
    ChangePasswordSerializer,
    RegisterSerializer,
    UpdateUserSerializer,
    UserSerializer,
)

User = get_user_model()


# ─── Registration ─────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Issue tokens immediately after registration
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


# ─── Login / Logout ───────────────────────────────────────────────────────────

class LoginView(TokenObtainPairView):
    """POST /api/v1/auth/login/ — returns access + refresh tokens."""
    permission_classes = [AllowAny]


class LogoutView(APIView):
    """POST /api/v1/auth/logout/ — blacklists the refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"detail": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


# ─── Me ───────────────────────────────────────────────────────────────────────

class MeView(generics.RetrieveUpdateAPIView):
    """GET/PUT /api/v1/auth/me/ — current user's profile."""
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UpdateUserSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


# ─── Change Password ──────────────────────────────────────────────────────────

class ChangePasswordView(APIView):
    """POST /api/v1/auth/change-password/"""
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"detail": "Password changed successfully."})
