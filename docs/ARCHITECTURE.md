# Job Board — Architecture Document

> **Status**: Proposed  
> **Last Updated**: 2025  
> **Stack**: Django (BE) · React (FE) · PostgreSQL (DB)

---

## Table of Contents

1. [Overview](#1-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Repository Layout](#3-repository-layout)
4. [Backend — Django + uv + pyproject](#4-backend--django--uv--pyproject)
   - 4.1 [Technology Choices](#41-technology-choices)
   - 4.2 [Django App Structure](#42-django-app-structure)
   - 4.3 [Data Models](#43-data-models)
   - 4.4 [REST API Design](#44-rest-api-design)
   - 4.5 [Authentication & Authorisation](#45-authentication--authorisation)
   - 4.6 [Configuration & Environment](#46-configuration--environment)
5. [Frontend — React + Bun + Rsbuild](#5-frontend--react--bun--rsbuild)
   - 5.1 [Technology Choices](#51-technology-choices)
   - 5.2 [Project Structure](#52-project-structure)
   - 5.3 [Routing](#53-routing)
   - 5.4 [State Management](#54-state-management)
   - 5.5 [API Layer](#55-api-layer)
6. [Database](#6-database)
7. [Auth Flow](#7-auth-flow)
8. [Developer Workflow](#8-developer-workflow)
9. [Testing Strategy](#9-testing-strategy)
10. [Deployment](#10-deployment)
11. [Key Decisions & Trade-offs](#11-key-decisions--trade-offs)

---

## 1. Overview

**Job Board** is a full-stack web application that connects **employers** (who post job listings) with **candidates** (who browse and apply). Core capabilities:

| Actor | Capabilities |
|---|---|
| **Employer** | Register, create/edit/delete job postings, manage applications |
| **Candidate** | Register, browse/search/filter jobs, submit applications, manage profile |
| **Admin** | Manage all users, jobs, and applications via Django admin |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser                                │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │              React SPA  (Bun + Rsbuild)                 │  │
│   │  /jobs  /jobs/:id  /dashboard  /login  /register  ...  │  │
│   └──────────────────────┬──────────────────────────────────┘  │
└──────────────────────────│──────────────────────────────────────┘
                           │  HTTPS  (JSON / REST)
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Django Application Server                      │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  accounts    │  │    jobs      │  │    applications      │   │
│  │  Django app  │  │  Django app  │  │    Django app        │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                  │
│  ┌────────────────────┐  ┌──────────────────────────────────┐   │
│  │  Django REST       │  │  SimpleJWT / Token Auth          │   │
│  │  Framework (DRF)   │  │                                  │   │
│  └────────────────────┘  └──────────────────────────────────┘   │
└───────────────────────────────┬──────────────────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
      │  PostgreSQL  │  │  Redis       │  │  S3-compat   │
      │  (primary)   │  │  (cache/     │  │  (file       │
      │              │  │   sessions)  │  │   uploads)   │
      └──────────────┘  └──────────────┘  └──────────────┘
```

**Communication pattern**: The React SPA is a pure client-side app served as static files. It communicates with the Django backend exclusively through a versioned JSON REST API (`/api/v1/…`). There is no server-side rendering.

---

## 3. Repository Layout

```
django-react-job-board/
│
├── backend/                        # Django project root
│   ├── pyproject.toml              # Project metadata, deps managed by uv
│   ├── uv.lock                     # Locked dependency tree
│   ├── .python-version             # Pinned Python version (for uv)
│   ├── manage.py
│   ├── config/                     # Django project package
│   │   ├── __init__.py
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── apps/
│   │   ├── accounts/               # User model, auth
│   │   ├── jobs/                   # Job listings
│   │   └── applications/           # Job applications
│   └── tests/
│
├── frontend/                       # React application
│   ├── package.json                # Managed by Bun
│   ├── bun.lockb                   # Bun lockfile
│   ├── rsbuild.config.ts           # Rsbuild build config
│   ├── tsconfig.json
│   ├── public/
│   └── src/
│       ├── main.tsx                # Entry point
│       ├── App.tsx
│       ├── api/                    # API client / fetch wrappers
│       ├── components/             # Shared UI components
│       ├── features/               # Feature-sliced modules
│       │   ├── auth/
│       │   ├── jobs/
│       │   └── applications/
│       ├── hooks/                  # Custom React hooks
│       ├── pages/                  # Route-level page components
│       ├── store/                  # Global state (Zustand)
│       └── types/                  # Shared TypeScript types
│
├── docs/
│   └── ARCHITECTURE.md             # ← this file
│
├── .env.example                    # Environment variable template
├── .gitignore
├── docker-compose.yml              # Local dev services (Postgres, Redis)
└── README.md
```

---

## 4. Backend — Django + uv + pyproject

### 4.1 Technology Choices

| Tool | Role | Why |
|---|---|---|
| **Python 3.12+** | Runtime | Latest stable; uv enforces the pin |
| **Django 5.x** | Web framework | Batteries-included ORM, admin, migrations |
| **uv** | Package & venv manager | Extremely fast, replaces pip + pip-tools; single `pyproject.toml` source of truth |
| **Django REST Framework** | API layer | Serialisers, viewsets, routers — mature ecosystem |
| **djangorestframework-simplejwt** | Auth tokens | Stateless JWT; refresh token rotation |
| **django-cors-headers** | CORS | Allow the React dev server (different origin) |
| **django-filter** | Query filtering | Declarative filter classes for job search |
| **Gunicorn** | WSGI server (prod) | Standard, stable |
| **PostgreSQL** | Database | See §6 |

#### `pyproject.toml` skeleton

```toml
[project]
name = "job-board-backend"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "django>=5.0",
    "djangorestframework",
    "djangorestframework-simplejwt",
    "django-cors-headers",
    "django-filter",
    "psycopg[binary]",
    "python-decouple",   # env var management
    "gunicorn",
]

[dependency-groups]
dev = [
    "pytest-django",
    "factory-boy",
    "ruff",
    "mypy",
    "django-stubs",
]

[tool.uv]
dev-dependencies = ["pytest-django", "factory-boy", "ruff", "mypy", "django-stubs"]

[tool.ruff]
line-length = 88
select = ["E", "F", "I", "UP"]

[tool.pytest.ini_options]
DJANGO_SETTINGS_MODULE = "config.settings.development"
```

### 4.2 Django App Structure

```
apps/
├── accounts/
│   ├── models.py        # CustomUser (AbstractBaseUser)
│   ├── serializers.py
│   ├── views.py         # register, login, me, logout
│   ├── urls.py
│   └── permissions.py   # IsEmployer, IsCandidate
│
├── jobs/
│   ├── models.py        # Job, Category, Tag, Location
│   ├── serializers.py
│   ├── views.py         # JobViewSet (CRUD + search)
│   ├── filters.py       # JobFilter (django-filter)
│   └── urls.py
│
└── applications/
    ├── models.py        # Application
    ├── serializers.py
    ├── views.py         # ApplicationViewSet
    └── urls.py
```

### 4.3 Data Models

#### `CustomUser`
```
CustomUser
  id            UUID  PK
  email         str   unique  (login credential)
  full_name     str
  role          enum  [candidate | employer]
  is_active     bool
  created_at    datetime
  updated_at    datetime

EmployerProfile  (OneToOne → CustomUser[role=employer])
  company_name  str
  website       str
  description   text
  logo          ImageField

CandidateProfile  (OneToOne → CustomUser[role=candidate])
  headline      str
  bio           text
  resume        FileField
  location      str
  linkedin_url  str
```

#### `Job`
```
Job
  id            UUID  PK
  employer      FK → CustomUser[role=employer]
  title         str
  slug          str   unique
  category      FK → Category
  tags          M2M → Tag
  job_type      enum  [full_time | part_time | contract | internship | remote]
  location      str
  salary_min    int   nullable
  salary_max    int   nullable
  description   text  (Markdown)
  requirements  text
  is_active     bool
  deadline      date  nullable
  created_at    datetime
  updated_at    datetime

Category
  id    int  PK
  name  str
  slug  str  unique

Tag
  id    int  PK
  name  str
```

#### `Application`
```
Application
  id              UUID  PK
  job             FK → Job
  candidate       FK → CustomUser[role=candidate]
  status          enum  [pending | reviewing | shortlisted | rejected | hired]
  cover_letter    text  nullable
  resume_snapshot FileField  (copy at time of apply)
  created_at      datetime
  updated_at      datetime

  UNIQUE (job, candidate)
```

### 4.4 REST API Design

Base path: `/api/v1/`

#### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register/` | Create account (role in body) |
| POST | `/auth/login/` | Obtain access + refresh JWT |
| POST | `/auth/token/refresh/` | Rotate access token |
| POST | `/auth/logout/` | Blacklist refresh token |
| GET/PUT | `/auth/me/` | Current user profile |

#### Jobs

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/jobs/` | Public | List jobs (paginated, filterable) |
| POST | `/jobs/` | Employer | Create job |
| GET | `/jobs/:slug/` | Public | Job detail |
| PUT/PATCH | `/jobs/:slug/` | Owner employer | Update job |
| DELETE | `/jobs/:slug/` | Owner employer | Delete job |
| GET | `/jobs/my/` | Employer | My job listings |

**Query parameters for `GET /jobs/`**

```
?search=        Full-text search (title, description)
?category=      Category slug
?job_type=      full_time | part_time | …
?location=      City / region string
?salary_min=    Integer
?salary_max=    Integer
?ordering=      created_at | -created_at | salary_min
?page=          Page number
?page_size=     1–100 (default 20)
```

#### Applications

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/jobs/:slug/apply/` | Candidate | Submit application |
| GET | `/applications/` | Candidate | My applications |
| GET | `/jobs/:slug/applications/` | Employer (owner) | Applications for a job |
| PATCH | `/applications/:id/` | Employer | Update application status |

#### Profiles

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET/PUT | `/profiles/employer/:id/` | Public/Owner | Employer company profile |
| GET/PUT | `/profiles/candidate/me/` | Owner | Candidate profile |

### 4.5 Authentication & Authorisation

- **JWT** (SimpleJWT): short-lived access token (15 min) + long-lived refresh token (7 days) stored in `httpOnly` cookies (not localStorage).
- **Custom permission classes**:
  - `IsEmployer` — role check
  - `IsCandidate` — role check
  - `IsJobOwner` — employer must own the job
  - `IsApplicationOwnerOrJobOwner` — candidate or the employer of that job
- CORS restricted to the frontend origin via `CORS_ALLOWED_ORIGINS`.

### 4.6 Configuration & Environment

Settings are split by environment, loaded via `python-decouple` reading `.env`:

```
# .env.example
SECRET_KEY=
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://user:pass@localhost:5432/jobboard
REDIS_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:3000
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
```

---

## 5. Frontend — React + Bun + Rsbuild

### 5.1 Technology Choices

| Tool | Role | Why |
|---|---|---|
| **Bun** | Runtime, package manager, test runner | Drop-in npm/Node replacement; significantly faster installs & scripts |
| **Rsbuild** | Build tool | Rspack (Rust-based Webpack) under the hood; fast HMR, zero-config React support |
| **React 19** | UI library | Component model, hooks |
| **TypeScript** | Language | Type safety across FE codebase |
| **React Router v7** | Client-side routing | File-based or config-based routes |
| **Zustand** | Global state | Minimal boilerplate; no context hell |
| **TanStack Query** | Server-state / caching | Caches API responses, handles loading/error states, deduplicates requests |
| **Axios** | HTTP client | Interceptors for JWT token injection & refresh |
| **Tailwind CSS** | Styling | Utility-first; pairs well with component libraries |
| **shadcn/ui** | Component library | Accessible, unstyled-ish, Tailwind-compatible |

### 5.2 Project Structure

```
src/
├── api/
│   ├── client.ts          # Axios instance, interceptors, token refresh logic
│   ├── auth.ts            # Auth endpoints
│   ├── jobs.ts            # Job endpoints
│   └── applications.ts    # Application endpoints
│
├── components/            # Truly shared, dumb components
│   ├── ui/                # shadcn/ui re-exports
│   ├── JobCard.tsx
│   ├── Pagination.tsx
│   ├── SearchBar.tsx
│   └── FilterSidebar.tsx
│
├── features/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── useAuth.ts     # Auth hooks (login/logout/register)
│   ├── jobs/
│   │   ├── JobList.tsx
│   │   ├── JobDetail.tsx
│   │   ├── JobForm.tsx    # Create/Edit (employer)
│   │   └── useJobs.ts
│   └── applications/
│       ├── ApplyForm.tsx
│       ├── ApplicationList.tsx
│       └── useApplications.ts
│
├── hooks/
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
│
├── pages/
│   ├── HomePage.tsx          # /
│   ├── JobsPage.tsx          # /jobs
│   ├── JobDetailPage.tsx     # /jobs/:slug
│   ├── LoginPage.tsx         # /login
│   ├── RegisterPage.tsx      # /register
│   ├── DashboardPage.tsx     # /dashboard (employer)
│   ├── MyApplicationsPage.tsx# /my-applications (candidate)
│   └── ProfilePage.tsx       # /profile
│
├── store/
│   └── authStore.ts          # Zustand store: user, token, actions
│
├── types/
│   ├── user.ts
│   ├── job.ts
│   └── application.ts
│
├── App.tsx                   # Router definition
└── main.tsx                  # ReactDOM.createRoot, QueryClientProvider
```

### 5.3 Routing

```
/                     → HomePage         (public)
/jobs                 → JobsPage         (public)
/jobs/:slug           → JobDetailPage    (public)
/login                → LoginPage        (guest only)
/register             → RegisterPage     (guest only)
/dashboard            → DashboardPage    (employer only)
/dashboard/jobs/new   → JobForm          (employer only)
/dashboard/jobs/:slug/edit → JobForm     (employer only)
/my-applications      → MyApplicationsPage (candidate only)
/profile              → ProfilePage      (authenticated)
```

Route guards: a `<ProtectedRoute>` wrapper reads `authStore` and redirects unauthenticated users to `/login`. A `<RoleRoute role="employer">` wrapper enforces role access.

### 5.4 State Management

```
Zustand authStore
  user: User | null
  accessToken: string | null
  setAuth(user, token) → void
  clearAuth() → void

TanStack Query
  useJobsQuery(filters)       → paginated job list
  useJobDetailQuery(slug)     → single job
  useMyApplicationsQuery()    → candidate's applications
  useJobApplicationsQuery()   → employer's applications for a job
  useCreateJobMutation()
  useApplyMutation()
  useUpdateApplicationMutation()
```

### 5.5 API Layer

```typescript
// src/api/client.ts  (sketch)
const client = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,   // send httpOnly cookie with refresh token
});

// Attach access token from Zustand on every request
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 → attempt silent refresh → retry original request
client.interceptors.response.use(undefined, tokenRefreshInterceptor);
```

---

## 6. Database

**PostgreSQL** is the sole database.

- Django ORM handles all queries; raw SQL only when profiling identifies a bottleneck.
- UUIDs as primary keys for all user-facing models (avoids enumeration).
- Full-text search: Django's `SearchVector` / `SearchQuery` on `Job.title` + `Job.description` (GIN index). Upgrade to dedicated search (Meilisearch / Elasticsearch) if corpus grows beyond ~100 k rows.
- Redis is used for:
  - Django session/cache backend
  - (future) rate-limiting, Celery broker

### Indexes (notable)

| Table | Index |
|---|---|
| `jobs_job` | `is_active`, `created_at DESC`, `category_id` |
| `jobs_job` | GIN on `search_vector` (tsvector) |
| `applications_application` | `(job_id, candidate_id)` UNIQUE |

---

## 7. Auth Flow

```
[1] Register / Login
    FE → POST /auth/login/ { email, password }
    BE → { access_token }  +  Set-Cookie: refresh_token (httpOnly, Secure, SameSite=Lax)
    FE stores access_token in Zustand (memory only — not localStorage)

[2] Authenticated requests
    FE → request + Authorization: Bearer <access_token>
    BE → validates JWT, resolves user

[3] Token refresh (silent, automatic)
    access_token expires (15 min)
    Axios interceptor catches 401 → POST /auth/token/refresh/ (cookie sent automatically)
    BE → new access_token
    Interceptor retries original request

[4] Logout
    FE → POST /auth/logout/ (sends refresh cookie)
    BE → blacklists refresh token
    FE clears Zustand state → redirect /login
```

---

## 8. Developer Workflow

### Prerequisites

- **Python 3.12+** and **uv** installed globally
- **Bun** installed globally
- **Docker + Docker Compose** (for Postgres & Redis)

### Bootstrap

```zsh
# 1. Start backing services
docker compose up -d

# 2. Backend
cd backend
uv sync                          # creates .venv, installs all deps
uv run manage.py migrate
uv run manage.py createsuperuser
uv run manage.py runserver       # http://localhost:8000

# 3. Frontend (separate terminal)
cd frontend
bun install
bun run dev                      # http://localhost:3000
```

### Common commands

| Task | Command |
|---|---|
| Add a BE dependency | `uv add <package>` |
| Add a dev BE dep | `uv add --dev <package>` |
| Run BE tests | `uv run pytest` |
| Lint/format BE | `uv run ruff check . && uv run ruff format .` |
| Add a FE dependency | `bun add <package>` |
| Run FE dev server | `bun run dev` |
| Build FE for prod | `bun run build` |
| Run FE tests | `bun test` |

---

## 9. Testing Strategy

### Backend

| Layer | Tool | Coverage target |
|---|---|---|
| Models | `pytest-django` + `factory-boy` | 100 % model logic |
| Serializers | `pytest-django` | Validation edge cases |
| API (integration) | DRF `APIClient` | All endpoints, all permission combos |
| Auth | `pytest-django` | Token lifecycle |

### Frontend

| Layer | Tool |
|---|---|
| Unit (hooks, utils) | `bun test` (built-in) |
| Component | React Testing Library |
| E2E | Playwright (future) |

---

## 10. Deployment

```
┌──────────────────────────────────────────────────────┐
│                    Cloud (e.g. Fly.io / Render)      │
│                                                      │
│  ┌──────────────────┐   ┌──────────────────────┐    │
│  │  Django + Gunicorn│   │  Static Files (FE)   │    │
│  │  (app server)    │   │  served via CDN /    │    │
│  │                  │   │  Nginx / Cloudflare  │    │
│  └────────┬─────────┘   └──────────────────────┘    │
│           │                                          │
│  ┌────────▼─────────┐   ┌──────────────────────┐    │
│  │  PostgreSQL       │   │  Redis               │    │
│  │  (managed)        │   │  (managed)           │    │
│  └──────────────────┘   └──────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

- **FE build**: `bun run build` → outputs to `frontend/dist/` → uploaded to S3/CDN or served by Nginx.
- **BE**: Gunicorn behind Nginx (or a PaaS reverse proxy). Static files collected via `manage.py collectstatic` → S3.
- **Environment**: all secrets injected via env vars (never committed).
- **Migrations**: run as a release step (`uv run manage.py migrate`) before traffic is routed to new version.

---

## 11. Key Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|---|---|---|
| **uv** over Poetry/pip | 10–100× faster installs; single lock file; PEP 517 native | Newer tooling; less community history vs pip |
| **Rsbuild** over Vite | Rspack (Rust) is faster for large bundles; Webpack compatibility | Vite has a larger ecosystem of plugins |
| **Bun** over Node/npm | Fastest installs, built-in test runner, native TS execution | Bun is newer; some Node APIs still incomplete |
| **JWT in httpOnly cookie** | XSS-proof token storage vs localStorage | Requires CSRF handling; slightly more complex BE logic |
| **UUID PKs** | No enumeration of resources by ID | Slightly larger index size; debugging harder |
| **PostgreSQL FTS** | No extra service for initial search | Scaling beyond ~100 k jobs needs a dedicated search engine |
| **SPA (no SSR)** | Simpler architecture, no Django template coupling | SEO limited to static meta tags; add Next.js later if needed |
| **Zustand over Redux** | Minimal boilerplate, no provider nesting | Less structure for very large teams |
| **TanStack Query** | Handles caching, pagination, background refresh automatically | Learning curve; not needed for trivial apps |
