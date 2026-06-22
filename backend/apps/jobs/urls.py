"""
jobs/urls.py
"""
from django.urls import path

from apps.applications.views import ApplyToJobView, JobApplicationListView

from .views import CategoryListView, JobDetailView, JobListCreateView, MyJobListView, TagListView

urlpatterns = [
    path("", JobListCreateView.as_view(), name="job-list-create"),
    path("my/", MyJobListView.as_view(), name="job-my-list"),
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("tags/", TagListView.as_view(), name="tag-list"),
    path("<slug:slug>/", JobDetailView.as_view(), name="job-detail"),
    path("<slug:slug>/apply/", ApplyToJobView.as_view(), name="job-apply"),
    path("<slug:slug>/applications/", JobApplicationListView.as_view(), name="job-applications"),
]
