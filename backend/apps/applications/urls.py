"""
applications/urls.py
Note: the apply + job-applications endpoints are nested under /jobs/:slug/
and wired up in jobs/urls.py; only the "my applications" and detail
endpoints live here.
"""
from django.urls import path

from .views import ApplicationDetailView, MyApplicationListView

urlpatterns = [
    path("", MyApplicationListView.as_view(), name="my-applications"),
    path("<uuid:id>/", ApplicationDetailView.as_view(), name="application-detail"),
]
