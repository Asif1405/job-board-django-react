"""
Management command: python manage.py seed
Populates the database with realistic dummy data for development.

Creates:
  • 8 categories, 20 tags
  • 3 employer users + profiles  (employer1-3@jobboard.dev / pass: Test1234!)
  • 5 candidate users + profiles (candidate1-5@jobboard.dev / pass: Test1234!)
  • 15 job listings spread across employers / categories / tags
  • 20 applications (candidates apply to various jobs with varied statuses)
"""
import random
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import CandidateProfile, EmployerProfile, Role
from apps.applications.models import Application, ApplicationStatus
from apps.jobs.models import Category, Job, JobType, Tag

User = get_user_model()

PASSWORD = "Test1234!"

# ── Seed data ──────────────────────────────────────────────────────────────────

CATEGORIES = [
    "Engineering",
    "Design",
    "Product",
    "Marketing",
    "Data & Analytics",
    "DevOps & Cloud",
    "Finance",
    "Customer Success",
]

TAGS = [
    "Python", "Django", "React", "TypeScript", "Node.js",
    "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS",
    "GCP", "Figma", "SQL", "Machine Learning", "REST API",
    "GraphQL", "Go", "Rust", "Tailwind CSS", "CI/CD",
]

EMPLOYERS = [
    {
        "full_name": "Alice Hiring",
        "email": "employer1@jobboard.dev",
        "company_name": "TechCorp Inc.",
        "website": "https://techcorp.example.com",
        "description": (
            "TechCorp is a fast-growing SaaS company building tools for "
            "distributed teams. We value craft, ownership and curiosity."
        ),
    },
    {
        "full_name": "Bob Recruiter",
        "email": "employer2@jobboard.dev",
        "company_name": "CloudNine Solutions",
        "website": "https://cloudnine.example.com",
        "description": (
            "CloudNine builds cloud-native infrastructure products used by "
            "thousands of engineering teams worldwide."
        ),
    },
    {
        "full_name": "Carol Manager",
        "email": "employer3@jobboard.dev",
        "company_name": "DesignLab Studio",
        "website": "https://designlab.example.com",
        "description": (
            "DesignLab is a product design studio working with Series A–C "
            "startups to ship beautiful, user-centred software."
        ),
    },
]

CANDIDATES = [
    {
        "full_name": "David Dev",
        "email": "candidate1@jobboard.dev",
        "headline": "Senior Full-Stack Engineer",
        "bio": "5+ years building web apps with Django and React. Love clean APIs and fast UIs.",
        "location": "San Francisco, CA",
        "linkedin_url": "https://linkedin.com/in/daviddev",
    },
    {
        "full_name": "Eva Engineer",
        "email": "candidate2@jobboard.dev",
        "headline": "DevOps & Cloud Specialist",
        "bio": "Kubernetes fanatic. AWS certified. I automate everything that can be automated.",
        "location": "Austin, TX",
        "linkedin_url": "https://linkedin.com/in/evaengineer",
    },
    {
        "full_name": "Frank Designer",
        "email": "candidate3@jobboard.dev",
        "headline": "Product Designer (UI/UX)",
        "bio": "Figma power user. I bridge the gap between beautiful interfaces and measurable outcomes.",
        "location": "New York, NY",
        "linkedin_url": "https://linkedin.com/in/frankdesigner",
    },
    {
        "full_name": "Grace Analyst",
        "email": "candidate4@jobboard.dev",
        "headline": "Data Analyst & ML Enthusiast",
        "bio": "SQL wizard. Python + pandas + scikit-learn for day-to-day analysis and modelling.",
        "location": "Chicago, IL",
        "linkedin_url": "https://linkedin.com/in/graceanalyst",
    },
    {
        "full_name": "Henry Backend",
        "email": "candidate5@jobboard.dev",
        "headline": "Backend Engineer (Python/Go)",
        "bio": "Passionate about distributed systems, message queues and everything that scales.",
        "location": "Seattle, WA",
        "linkedin_url": "https://linkedin.com/in/henrybackend",
    },
]

JOBS = [
    # ── TechCorp ──────────────────────────────────────────────────────────────
    {
        "title": "Senior Django Engineer",
        "category": "Engineering",
        "tags": ["Python", "Django", "PostgreSQL", "REST API", "Docker"],
        "job_type": JobType.FULL_TIME,
        "location": "Remote (US)",
        "salary_min": 130_000,
        "salary_max": 160_000,
        "description": (
            "## About the role\n\n"
            "We're looking for a Senior Django Engineer to lead the development of our "
            "core API platform. You'll own backend features end-to-end — from database "
            "schema design to API contract — and collaborate closely with our React "
            "frontend team.\n\n"
            "## What you'll do\n\n"
            "- Architect and build scalable REST APIs using Django + DRF\n"
            "- Design and optimise PostgreSQL schemas\n"
            "- Review PRs, mentor junior engineers\n"
            "- Contribute to architecture decisions and technical roadmap\n\n"
            "## Stack\n\nDjango 5, PostgreSQL 16, Redis, Docker, GitHub Actions"
        ),
        "requirements": (
            "- 4+ years of professional Python/Django experience\n"
            "- Strong SQL fundamentals\n"
            "- Experience with REST API design patterns\n"
            "- Comfortable working async/remote"
        ),
        "is_active": True,
        "employer_idx": 0,
    },
    {
        "title": "React Frontend Engineer",
        "category": "Engineering",
        "tags": ["React", "TypeScript", "Tailwind CSS", "REST API"],
        "job_type": JobType.FULL_TIME,
        "location": "Remote (US)",
        "salary_min": 120_000,
        "salary_max": 150_000,
        "description": (
            "## About the role\n\n"
            "Join our product engineering team and build the next generation of our "
            "SaaS dashboard. You'll work closely with our design team (Figma files "
            "provided) and backend engineers.\n\n"
            "## What you'll do\n\n"
            "- Build performant React 19 components with TypeScript\n"
            "- Integrate with our Django REST API\n"
            "- Implement pixel-perfect designs from Figma\n"
            "- Write unit and integration tests\n\n"
            "## Stack\n\nReact 19, TypeScript, Tailwind CSS, Rsbuild, TanStack Query"
        ),
        "requirements": (
            "- 3+ years React experience\n"
            "- Strong TypeScript skills\n"
            "- Experience with REST API integration\n"
            "- Eye for detail and UX"
        ),
        "is_active": True,
        "employer_idx": 0,
    },
    {
        "title": "Product Manager – Platform",
        "category": "Product",
        "tags": ["REST API", "SQL"],
        "job_type": JobType.FULL_TIME,
        "location": "San Francisco, CA",
        "salary_min": 140_000,
        "salary_max": 170_000,
        "description": (
            "## About the role\n\n"
            "We're hiring a Product Manager to own our developer-facing platform "
            "products. You'll work with engineers, designers, and customers to define "
            "and ship features that make developers' lives easier.\n\n"
            "## What you'll do\n\n"
            "- Define product strategy and roadmap for the platform\n"
            "- Write clear, detailed specs and user stories\n"
            "- Run discovery interviews with customers\n"
            "- Partner with engineering on delivery"
        ),
        "requirements": (
            "- 3+ years in product management\n"
            "- Technical background or experience working on developer tools\n"
            "- Strong written communication\n"
            "- Data-driven decision making"
        ),
        "is_active": True,
        "employer_idx": 0,
    },
    {
        "title": "Growth Marketing Manager",
        "category": "Marketing",
        "tags": ["SQL"],
        "job_type": JobType.FULL_TIME,
        "location": "New York, NY",
        "salary_min": 100_000,
        "salary_max": 125_000,
        "description": (
            "## About the role\n\n"
            "TechCorp is looking for a data-driven Growth Marketing Manager to own "
            "our acquisition funnel — from paid channels through to activation.\n\n"
            "## What you'll do\n\n"
            "- Run and optimise paid campaigns (Google, LinkedIn)\n"
            "- A/B test landing pages and onboarding flows\n"
            "- Analyse funnel metrics and report to leadership\n"
            "- Partner with content and design on campaign assets"
        ),
        "requirements": (
            "- 3+ years B2B SaaS marketing experience\n"
            "- Hands-on with paid acquisition channels\n"
            "- SQL/analytics skills a big plus\n"
            "- Strong project management"
        ),
        "is_active": True,
        "employer_idx": 0,
    },
    # ── CloudNine ─────────────────────────────────────────────────────────────
    {
        "title": "Senior DevOps Engineer",
        "category": "DevOps & Cloud",
        "tags": ["Kubernetes", "Docker", "AWS", "CI/CD", "Go"],
        "job_type": JobType.FULL_TIME,
        "location": "Remote (Worldwide)",
        "salary_min": 140_000,
        "salary_max": 175_000,
        "description": (
            "## About the role\n\n"
            "CloudNine is hiring a Senior DevOps Engineer to lead our platform "
            "reliability and developer experience efforts. You'll own CI/CD, "
            "Kubernetes cluster management and incident response.\n\n"
            "## What you'll do\n\n"
            "- Manage multi-cluster Kubernetes infrastructure on AWS EKS\n"
            "- Build and maintain CI/CD pipelines (GitHub Actions, ArgoCD)\n"
            "- Drive SRE practices: SLOs, alerting, on-call runbooks\n"
            "- Collaborate with engineering teams on infra needs\n\n"
            "## Stack\n\nAWS EKS, Terraform, GitHub Actions, ArgoCD, Datadog"
        ),
        "requirements": (
            "- 4+ years DevOps/SRE experience\n"
            "- Kubernetes expertise (CKA preferred)\n"
            "- AWS or GCP certified\n"
            "- Infrastructure-as-code (Terraform/Pulumi)"
        ),
        "is_active": True,
        "employer_idx": 1,
    },
    {
        "title": "Backend Engineer – Go",
        "category": "Engineering",
        "tags": ["Go", "PostgreSQL", "Redis", "Docker", "Kubernetes"],
        "job_type": JobType.FULL_TIME,
        "location": "Remote (US/EU)",
        "salary_min": 135_000,
        "salary_max": 165_000,
        "description": (
            "## About the role\n\n"
            "Join our core platform team and build the high-throughput services "
            "that power CloudNine's data ingestion pipeline — processing millions "
            "of events per minute.\n\n"
            "## What you'll do\n\n"
            "- Build and maintain Go microservices\n"
            "- Design efficient data pipelines\n"
            "- Collaborate on API design (gRPC + REST)\n"
            "- Participate in on-call rotation"
        ),
        "requirements": (
            "- 3+ years Go experience in production\n"
            "- Experience with high-throughput distributed systems\n"
            "- PostgreSQL / Redis knowledge\n"
            "- Docker & Kubernetes"
        ),
        "is_active": True,
        "employer_idx": 1,
    },
    {
        "title": "Data Engineer",
        "category": "Data & Analytics",
        "tags": ["Python", "SQL", "PostgreSQL", "AWS", "Machine Learning"],
        "job_type": JobType.FULL_TIME,
        "location": "Austin, TX",
        "salary_min": 115_000,
        "salary_max": 145_000,
        "description": (
            "## About the role\n\n"
            "We're looking for a Data Engineer to build and maintain the data "
            "infrastructure that powers our analytics and ML products.\n\n"
            "## What you'll do\n\n"
            "- Design and build ELT pipelines (Python + dbt)\n"
            "- Maintain our data warehouse (Snowflake / Redshift)\n"
            "- Collaborate with data scientists on feature engineering\n"
            "- Ensure data quality and reliability"
        ),
        "requirements": (
            "- 3+ years data engineering experience\n"
            "- Strong SQL (window functions, CTEs)\n"
            "- Python (pandas, SQLAlchemy)\n"
            "- Experience with dbt or Airflow"
        ),
        "is_active": True,
        "employer_idx": 1,
    },
    {
        "title": "Cloud Solutions Architect",
        "category": "DevOps & Cloud",
        "tags": ["AWS", "GCP", "Kubernetes", "Terraform", "Docker"],
        "job_type": JobType.CONTRACT,
        "location": "Remote (US)",
        "salary_min": 150_000,
        "salary_max": 200_000,
        "description": (
            "## About the role\n\n"
            "CloudNine is looking for a Cloud Solutions Architect (contract) to help "
            "enterprise customers design and migrate their workloads to our platform.\n\n"
            "## What you'll do\n\n"
            "- Lead architecture workshops with enterprise customers\n"
            "- Design scalable cloud-native reference architectures\n"
            "- Produce technical documentation and diagrams\n"
            "- Advise on security and compliance"
        ),
        "requirements": (
            "- 6+ years cloud architecture experience\n"
            "- AWS Solutions Architect Professional or equivalent\n"
            "- Strong customer-facing communication\n"
            "- Kubernetes and containerisation expertise"
        ),
        "is_active": True,
        "employer_idx": 1,
    },
    {
        "title": "Junior Data Analyst",
        "category": "Data & Analytics",
        "tags": ["SQL", "Python", "Machine Learning"],
        "job_type": JobType.FULL_TIME,
        "location": "Austin, TX",
        "salary_min": 65_000,
        "salary_max": 80_000,
        "description": (
            "## About the role\n\n"
            "A great entry-level opportunity for a curious, analytically minded "
            "graduate to join our data team and grow fast.\n\n"
            "## What you'll do\n\n"
            "- Write SQL queries to answer business questions\n"
            "- Build dashboards in Metabase / Looker\n"
            "- Support the data engineering team with pipeline tasks\n"
            "- Present findings to stakeholders"
        ),
        "requirements": (
            "- Degree in a quantitative field (CS, Stats, Maths, Economics)\n"
            "- Strong SQL fundamentals\n"
            "- Python basics (pandas preferred)\n"
            "- Curiosity and eagerness to learn"
        ),
        "is_active": True,
        "employer_idx": 1,
    },
    # ── DesignLab ───────────────────────────────��─────────────────────────────
    {
        "title": "Senior Product Designer",
        "category": "Design",
        "tags": ["Figma", "REST API"],
        "job_type": JobType.FULL_TIME,
        "location": "New York, NY",
        "salary_min": 120_000,
        "salary_max": 150_000,
        "description": (
            "## About the role\n\n"
            "DesignLab is looking for a Senior Product Designer to lead design "
            "across two client engagements per quarter — from discovery through "
            "to developer handoff.\n\n"
            "## What you'll do\n\n"
            "- Run user research and usability tests\n"
            "- Create wireframes, prototypes and high-fidelity designs in Figma\n"
            "- Present work to client stakeholders\n"
            "- Maintain and evolve design systems"
        ),
        "requirements": (
            "- 5+ years product design experience\n"
            "- Expert-level Figma\n"
            "- Strong portfolio of shipped B2B SaaS products\n"
            "- Excellent presentation and storytelling skills"
        ),
        "is_active": True,
        "employer_idx": 2,
    },
    {
        "title": "UX Researcher",
        "category": "Design",
        "tags": ["Figma"],
        "job_type": JobType.FULL_TIME,
        "location": "Remote (US)",
        "salary_min": 95_000,
        "salary_max": 120_000,
        "description": (
            "## About the role\n\n"
            "We're hiring a UX Researcher to establish a research practice at "
            "DesignLab, bringing user insights to every project we deliver.\n\n"
            "## What you'll do\n\n"
            "- Plan and conduct interviews, surveys and usability tests\n"
            "- Synthesise findings into actionable insights\n"
            "- Collaborate with designers on discovery\n"
            "- Build a library of research templates and best practices"
        ),
        "requirements": (
            "- 3+ years UX research experience\n"
            "- Proficiency in both qualitative and quantitative methods\n"
            "- Experience with tools like Maze, UserTesting or Hotjar\n"
            "- Strong written and verbal communication"
        ),
        "is_active": True,
        "employer_idx": 2,
    },
    {
        "title": "Frontend Engineer – Design Systems",
        "category": "Engineering",
        "tags": ["React", "TypeScript", "Tailwind CSS", "Figma", "CI/CD"],
        "job_type": JobType.FULL_TIME,
        "location": "Remote (US/EU)",
        "salary_min": 110_000,
        "salary_max": 140_000,
        "description": (
            "## About the role\n\n"
            "We need a Frontend Engineer who sits at the intersection of design "
            "and engineering to build and maintain our open-source design system "
            "used across all client projects.\n\n"
            "## What you'll do\n\n"
            "- Build React component libraries with TypeScript and Storybook\n"
            "- Ensure accessibility (WCAG 2.2 AA)\n"
            "- Maintain Figma ↔ code token pipeline\n"
            "- Publish and version packages to npm"
        ),
        "requirements": (
            "- 3+ years React/TypeScript\n"
            "- Experience building or contributing to design systems\n"
            "- Strong CSS fundamentals\n"
            "- Accessibility knowledge"
        ),
        "is_active": True,
        "employer_idx": 2,
    },
    {
        "title": "Motion Designer (Part-time)",
        "category": "Design",
        "tags": ["Figma"],
        "job_type": JobType.PART_TIME,
        "location": "Remote (Worldwide)",
        "salary_min": 40_000,
        "salary_max": 60_000,
        "description": (
            "## About the role\n\n"
            "DesignLab is looking for a part-time Motion Designer to add life to "
            "our clients' products — micro-interactions, onboarding animations, "
            "and marketing videos.\n\n"
            "## What you'll do\n\n"
            "- Create UI animations (Lottie / Framer Motion)\n"
            "- Produce short marketing videos and GIFs\n"
            "- Collaborate with designers on interaction specs\n"
            "- Deliver assets optimised for web"
        ),
        "requirements": (
            "- 2+ years motion design experience\n"
            "- Proficiency in After Effects, LottieFiles\n"
            "- Understanding of web animation constraints\n"
            "- Strong portfolio"
        ),
        "is_active": True,
        "employer_idx": 2,
    },
    {
        "title": "Design Intern (Summer 2025)",
        "category": "Design",
        "tags": ["Figma"],
        "job_type": JobType.INTERNSHIP,
        "location": "New York, NY",
        "salary_min": 25_000,
        "salary_max": 35_000,
        "description": (
            "## About the role\n\n"
            "Join DesignLab for a 12-week summer internship and work alongside "
            "senior designers on real client projects.\n\n"
            "## What you'll do\n\n"
            "- Assist with wireframing and visual design\n"
            "- Participate in user interviews\n"
            "- Contribute to design system documentation\n"
            "- Present your work at our end-of-summer showcase"
        ),
        "requirements": (
            "- Currently enrolled in a design-related degree\n"
            "- Figma basics\n"
            "- Curiosity and willingness to receive feedback\n"
            "- Portfolio of student or personal projects"
        ),
        "is_active": True,
        "employer_idx": 2,
        "deadline": date.today() + timedelta(days=45),
    },
    {
        "title": "Customer Success Manager",
        "category": "Customer Success",
        "tags": ["REST API"],
        "job_type": JobType.FULL_TIME,
        "location": "San Francisco, CA",
        "salary_min": 80_000,
        "salary_max": 105_000,
        "description": (
            "## About the role\n\n"
            "TechCorp is hiring a Customer Success Manager to own a portfolio of "
            "mid-market accounts and drive retention, expansion and advocacy.\n\n"
            "## What you'll do\n\n"
            "- Onboard new customers and run QBRs\n"
            "- Monitor health scores and proactively address churn risk\n"
            "- Surface product feedback to the PM team\n"
            "- Drive expansion revenue through upsell conversations"
        ),
        "requirements": (
            "- 2+ years CSM experience in B2B SaaS\n"
            "- Strong empathy and communication skills\n"
            "- Data-driven: comfortable with CRM dashboards\n"
            "- Technical aptitude — you enjoy learning the product deeply"
        ),
        "is_active": True,
        "employer_idx": 0,
    },
]

# (candidate_idx, job_idx, status, cover_letter_snippet)
APPLICATIONS = [
    (0, 0, ApplicationStatus.REVIEWING, "I have 6 years of Django experience and would love to join TechCorp."),
    (0, 1, ApplicationStatus.SHORTLISTED, "React is my primary stack and I'm excited about your product vision."),
    (0, 4, ApplicationStatus.PENDING, "Kubernetes and CI/CD are my daily tools — great opportunity."),
    (1, 4, ApplicationStatus.HIRED, "I hold a CKA cert and have managed EKS clusters at scale."),
    (1, 5, ApplicationStatus.REVIEWING, "Go is my language of choice; I've built gRPC services for 4 years."),
    (1, 7, ApplicationStatus.SHORTLISTED, "Cloud architecture is where I thrive. Excited to help your customers."),
    (2, 9, ApplicationStatus.PENDING, "Design is my passion — I've shipped B2B products at 3 startups."),
    (2, 10, ApplicationStatus.REVIEWING, "UX research is what gets me out of bed every morning."),
    (2, 12, ApplicationStatus.PENDING, "I love motion and I'd love to bring your clients' products to life."),
    (3, 6, ApplicationStatus.SHORTLISTED, "Data engineering with dbt and Airflow is my bread and butter."),
    (3, 8, ApplicationStatus.REVIEWING, "Junior but hungry — I have strong SQL and Python fundamentals."),
    (4, 0, ApplicationStatus.PENDING, "Python/Django is my main stack and I thrive in async environments."),
    (4, 5, ApplicationStatus.REVIEWING, "Go + distributed systems — this role has my name on it."),
    (0, 11, ApplicationStatus.PENDING, "I've built design systems from scratch and love the challenge."),
    (2, 13, ApplicationStatus.SHORTLISTED, "Internship applicant — Figma portfolio attached."),
    (3, 2, ApplicationStatus.REJECTED, "I'd love to move into PM from a technical background."),
    (4, 1, ApplicationStatus.PENDING, "Strong TypeScript skills, looking to contribute to your FE team."),
    (1, 6, ApplicationStatus.PENDING, "SQL + Python pipelines are my specialty."),
    (0, 14, ApplicationStatus.REVIEWING, "CSM with 3 years experience in B2B SaaS."),
    (3, 7, ApplicationStatus.PENDING, "AWS Solutions Architect Professional certified and excited to help."),
]


class Command(BaseCommand):
    help = "Seed the database with dummy data for development."

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete all existing seed data before re-seeding.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["flush"]:
            self.stdout.write(self.style.WARNING("Flushing existing data…"))
            Application.objects.all().delete()
            Job.objects.all().delete()
            Tag.objects.all().delete()
            Category.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.WARNING("Done.\n"))

        self.stdout.write(self.style.MIGRATE_HEADING("── Seeding categories ──"))
        categories = self._seed_categories()

        self.stdout.write(self.style.MIGRATE_HEADING("── Seeding tags ──"))
        tags = self._seed_tags()

        self.stdout.write(self.style.MIGRATE_HEADING("── Seeding employers ──"))
        employers = self._seed_employers()

        self.stdout.write(self.style.MIGRATE_HEADING("── Seeding candidates ──"))
        candidates = self._seed_candidates()

        self.stdout.write(self.style.MIGRATE_HEADING("── Seeding jobs ──"))
        jobs = self._seed_jobs(employers, categories, tags)

        self.stdout.write(self.style.MIGRATE_HEADING("── Seeding applications ──"))
        self._seed_applications(candidates, jobs)

        self.stdout.write(self.style.SUCCESS(
            f"\n✅  Seeding complete!\n"
            f"    Categories : {len(categories)}\n"
            f"    Tags       : {len(tags)}\n"
            f"    Employers  : {len(employers)}\n"
            f"    Candidates : {len(candidates)}\n"
            f"    Jobs       : {len(jobs)}\n"
            f"    Applications: {len(APPLICATIONS)}\n\n"
            f"Employer logins  : employer1@jobboard.dev … employer3@jobboard.dev\n"
            f"Candidate logins : candidate1@jobboard.dev … candidate5@jobboard.dev\n"
            f"Password         : {PASSWORD}\n"
        ))

    # ── Helpers ────────────────────────────────────────────────────────────────

    def _seed_categories(self):
        cats = {}
        for name in CATEGORIES:
            obj, created = Category.objects.get_or_create(name=name)
            cats[name] = obj
            self.stdout.write(f"  {'created' if created else 'exists ':7s} → {name}")
        return cats

    def _seed_tags(self):
        tag_objs = {}
        for name in TAGS:
            obj, created = Tag.objects.get_or_create(name=name)
            tag_objs[name] = obj
            self.stdout.write(f"  {'created' if created else 'exists ':7s} → {name}")
        return tag_objs

    def _seed_employers(self):
        employer_users = []
        for i, data in enumerate(EMPLOYERS, start=1):
            user, created = User.objects.get_or_create(
                email=data["email"],
                defaults={
                    "full_name": data["full_name"],
                    "role": Role.EMPLOYER,
                    "is_active": True,
                },
            )
            if created:
                user.set_password(PASSWORD)
                user.save()
            EmployerProfile.objects.get_or_create(
                user=user,
                defaults={
                    "company_name": data["company_name"],
                    "website": data["website"],
                    "description": data["description"],
                },
            )
            employer_users.append(user)
            self.stdout.write(
                f"  {'created' if created else 'exists ':7s} → {data['email']} ({data['company_name']})"
            )
        return employer_users

    def _seed_candidates(self):
        candidate_users = []
        for data in CANDIDATES:
            user, created = User.objects.get_or_create(
                email=data["email"],
                defaults={
                    "full_name": data["full_name"],
                    "role": Role.CANDIDATE,
                    "is_active": True,
                },
            )
            if created:
                user.set_password(PASSWORD)
                user.save()
            CandidateProfile.objects.get_or_create(
                user=user,
                defaults={
                    "headline": data["headline"],
                    "bio": data["bio"],
                    "location": data["location"],
                    "linkedin_url": data["linkedin_url"],
                },
            )
            candidate_users.append(user)
            self.stdout.write(
                f"  {'created' if created else 'exists ':7s} → {data['email']} ({data['headline']})"
            )
        return candidate_users

    def _seed_jobs(self, employers, categories, tags):
        job_objs = []
        for spec in JOBS:
            employer = employers[spec["employer_idx"]]
            category = categories.get(spec["category"])
            job, created = Job.objects.get_or_create(
                title=spec["title"],
                employer=employer,
                defaults={
                    "category": category,
                    "job_type": spec["job_type"],
                    "location": spec["location"],
                    "salary_min": spec.get("salary_min"),
                    "salary_max": spec.get("salary_max"),
                    "description": spec["description"],
                    "requirements": spec.get("requirements", ""),
                    "is_active": spec.get("is_active", True),
                    "deadline": spec.get("deadline"),
                },
            )
            if created:
                job_tag_names = spec.get("tags", [])
                job.tags.set([tags[t] for t in job_tag_names if t in tags])
            job_objs.append(job)
            self.stdout.write(
                f"  {'created' if created else 'exists ':7s} → {spec['title']} [{spec['job_type']}]"
            )
        return job_objs

    def _seed_applications(self, candidates, jobs):
        for candidate_idx, job_idx, status, cover in APPLICATIONS:
            candidate = candidates[candidate_idx]
            job = jobs[job_idx]
            app, created = Application.objects.get_or_create(
                job=job,
                candidate=candidate,
                defaults={
                    "status": status,
                    "cover_letter": cover,
                },
            )
            self.stdout.write(
                f"  {'created' if created else 'exists ':7s} → "
                f"{candidate.full_name} → {job.title} [{status}]"
            )
