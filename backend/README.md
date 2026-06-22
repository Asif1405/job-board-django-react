# Job Board Backend

Django REST API for the Job Board application. Managed with [uv](https://github.com/astral-sh/uv).

## Quick Start

### Prerequisites
- Python 3.12+
- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- PostgreSQL 16 (or use Docker Compose — see root `docker-compose.yml`)

### 1. Clone & enter the backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
uv sync
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your database credentials and secret key
```

### 4. Run database migrations
```bash
uv run python manage.py migrate
```

### 5. Create a superuser
```bash
uv run python manage.py createsuperuser
```

### 6. Start the development server
```bash
uv run python manage.py runserver
```

The API will be available at **http://localhost:8000/api/v1/**.

Django Admin: **http://localhost:8000/admin/**

---

## Development

### Run tests
```bash
uv run pytest
```

### Run tests with coverage
```bash
uv run pytest --cov=apps --cov-report=html
```

### Lint
```bash
uv run ruff check .
uv run ruff format --check .
```

### Auto-format
```bash
uv run ruff format .
```

### Type checking
```bash
uv run mypy .
```

### Create new migrations
```bash
uv run python manage.py makemigrations
```

---

## Project Structure

```
backend/
├── config/                  # Django project package
│   ├── settings/
│   │   ├── base.py          # Shared settings
│   │   ├── development.py   # Dev overrides
│   │   └── production.py    # Prod overrides
│   ├── urls.py              # Root URL config
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── accounts/            # CustomUser, profiles, auth views
│   ├── jobs/                # Job listings, categories, tags
│   └── applications/        # Job applications
├── tests/                   # Pytest test suite + factories
├── manage.py
├── pyproject.toml           # uv-managed dependencies
└── Dockerfile
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register/` | Public | Create account |
| POST | `/api/v1/auth/login/` | Public | Obtain JWT tokens |
| POST | `/api/v1/auth/token/refresh/` | Public | Refresh access token |
| POST | `/api/v1/auth/logout/` | Auth | Blacklist refresh token |
| GET/PUT | `/api/v1/auth/me/` | Auth | Current user profile |
| GET | `/api/v1/jobs/` | Public | List jobs |
| POST | `/api/v1/jobs/` | Employer | Create job |
| GET | `/api/v1/jobs/:slug/` | Public | Job detail |
| PUT/PATCH | `/api/v1/jobs/:slug/` | Owner | Update job |
| DELETE | `/api/v1/jobs/:slug/` | Owner | Delete job |
| GET | `/api/v1/jobs/my/` | Employer | My job listings |
| POST | `/api/v1/jobs/:slug/apply/` | Candidate | Submit application |
| GET | `/api/v1/jobs/:slug/applications/` | Employer | View applications |
| GET | `/api/v1/applications/` | Candidate | My applications |
| PATCH | `/api/v1/applications/:id/` | Employer | Update status |
