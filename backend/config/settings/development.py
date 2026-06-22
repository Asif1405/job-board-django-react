"""Development settings — extends base.py."""
from .base import *  # noqa: F401, F403
from .base import INSTALLED_APPS, MIDDLEWARE

DEBUG = True

# ─── Dev-only apps ──────────────────────────────────��─────────────────────────
INSTALLED_APPS += []  # add django-debug-toolbar here if desired

# ─── Database ─────────────────────────────────────────────────────────────────
# Override individual DB settings here or use the defaults from base.py.
# They read from .env automatically via python-decouple.

# ─── Email (console backend in dev) ──────────────────────────────────────────
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# ─── Django REST Framework (relaxed in dev) ──────────────────────────────────
REST_FRAMEWORK_DEV = {
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",  # HTML browsable API
    ),
}

from .base import REST_FRAMEWORK  # noqa: E402

REST_FRAMEWORK = {**REST_FRAMEWORK, **REST_FRAMEWORK_DEV}

# ─── CORS (all origins in dev) ───────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = True

# ─── Security (relaxed for local dev) ────────────────────────────────────────
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
