"""Root URL configuration for the Job Board project."""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

api_v1_urlpatterns = [
    path("auth/", include("apps.accounts.urls")),
    path("jobs/", include("apps.jobs.urls")),
    path("applications/", include("apps.applications.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1_urlpatterns)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
