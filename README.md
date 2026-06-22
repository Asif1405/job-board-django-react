# Job Board

A full-stack job board application built with Django (backend) and React (frontend).

## Stack

| Layer | Technology |
|---|---|
| Backend | Django 5 · Django REST Framework · uv |
| Frontend | React 19 · Bun · Rsbuild *(coming soon)* |
| Database | PostgreSQL 16 |
| Auth | JWT (djangorestframework-simplejwt) |
| Styling | Tailwind CSS *(coming soon)* |

## Getting Started

### Using Docker Compose (recommended for local services)

Start Postgres and Redis:
```bash
docker compose up db redis -d
```

### Backend

See [backend/README.md](backend/README.md) for full setup instructions.

```bash
cd backend
uv sync
cp .env.example .env   # fill in your values
uv run python manage.py migrate
uv run python manage.py runserver
```

API: http://localhost:8000/api/v1/

### Frontend

*(Coming soon)*

## Documentation

- [Architecture](docs/ARCHITECTURE.md)

## License

MIT
