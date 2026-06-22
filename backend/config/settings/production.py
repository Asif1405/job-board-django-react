"""Production settings — extends base.py."""
from .base import *  # noqa: F401, F403
from .base import MIDDLEWARE

DEBUG = False

# ─── Security ─────────────────────────────────────────────────────────────────
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# ─── Static files (WhiteNoise or S3) ─────────────────────────────────────────
# Add 'whitenoise.middleware.WhiteNoiseMiddleware' to MIDDLEWARE if serving
# static files directly from Gunicorn.
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.ManifestStaticFilesStorage"

# ─── Email ────────────────────────────────────────────────────────────────────
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.sendgrid.net"
EMAIL_PORT = 587
EMAIL_USE_TLS = True

# ─── Logging (production — JSON if needed) ───────────────────────────────────
# Extend LOGGING from base here if you want structured JSON logs in prod.
