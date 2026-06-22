"""
tests/factories.py
factory-boy factories shared across test modules.
"""
import factory
from factory.django import DjangoModelFactory

from apps.accounts.models import CandidateProfile, CustomUser, EmployerProfile, Role
from apps.applications.models import Application
from apps.jobs.models import Category, Job, JobType, Tag


class UserFactory(DjangoModelFactory):
    class Meta:
        model = CustomUser

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    full_name = factory.Faker("name")
    role = Role.CANDIDATE
    password = factory.PostGenerationMethodCall("set_password", "testpass123")


class EmployerFactory(UserFactory):
    role = Role.EMPLOYER

    @factory.post_generation
    def employer_profile(obj, create, extracted, **kwargs):
        if not create:
            return
        EmployerProfile.objects.create(user=obj, company_name=f"{obj.full_name} Corp")


class CandidateFactory(UserFactory):
    role = Role.CANDIDATE

    @factory.post_generation
    def candidate_profile(obj, create, extracted, **kwargs):
        if not create:
            return
        CandidateProfile.objects.create(user=obj)


class CategoryFactory(DjangoModelFactory):
    class Meta:
        model = Category

    name = factory.Sequence(lambda n: f"Category {n}")


class TagFactory(DjangoModelFactory):
    class Meta:
        model = Tag

    name = factory.Sequence(lambda n: f"tag-{n}")


class JobFactory(DjangoModelFactory):
    class Meta:
        model = Job

    employer = factory.SubFactory(EmployerFactory)
    title = factory.Faker("job")
    category = factory.SubFactory(CategoryFactory)
    job_type = JobType.FULL_TIME
    location = factory.Faker("city")
    description = factory.Faker("paragraph")
    is_active = True


class ApplicationFactory(DjangoModelFactory):
    class Meta:
        model = Application

    job = factory.SubFactory(JobFactory)
    candidate = factory.SubFactory(CandidateFactory)
    cover_letter = factory.Faker("paragraph")
