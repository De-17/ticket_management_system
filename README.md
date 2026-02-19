# Support Ticket System (Tech Intern Assessment)

This project implements a full Support Ticket System with:

- Django + Django REST Framework + PostgreSQL backend
- React frontend
- LLM-powered ticket classification (category + priority suggestions)
- Docker + Docker Compose setup for one-command startup

## Tech Stack

- Backend: Django, DRF, PostgreSQL
- Frontend: React + Vite
- LLM: OpenAI Chat Completions API
- Infra: Docker Compose

## Folder Structure

```text
clootrack_asgn/
  backend/
  frontend/
  docker-compose.yml
  .env.example
```

## Quick Start

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Set your OpenAI API key in `.env`:

```env
OPENAI_API_KEY=your_api_key_here
```

3. Start everything:

```bash
docker-compose up --build
```

## URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

## API Endpoints

- `POST /api/tickets/` create ticket
- `GET /api/tickets/` list tickets (newest first) with filters:
  - `?category=`
  - `?priority=`
  - `?status=`
  - `?search=` (title + description)
- `PATCH /api/tickets/<id>/` update ticket fields
- `GET /api/tickets/stats/` aggregated ticket stats
- `POST /api/tickets/classify/` LLM suggestions from description

## LLM Choice and Design

- Chosen provider: OpenAI
- Model default: `gpt-4o-mini` (configurable via `OPENAI_MODEL`)
- Prompt location: `backend/tickets/prompts.py`
- Output requirement: strict JSON with:
  - `category` in `billing|technical|account|general`
  - `priority` in `low|medium|high|critical`
- Error handling:
  - If LLM key is missing, API fails, times out, or returns invalid output, backend falls back to:
    - `category=general`
    - `priority=medium`
  - Ticket submission remains functional even when classification fails.

## Database Aggregation

`/api/tickets/stats/` uses Django ORM DB-level aggregation:

- `Count` for total/open
- grouped `Count` for priority/category breakdown
- grouped-per-day + `Avg` for `avg_tickets_per_day`

No Python-level counting loops are used to compute aggregates.

## Design Decisions

- Explicit DB `CheckConstraint`s enforce valid choices for category/priority/status.
- Additional DB constraints prevent empty title/description strings.
- Frontend calls classify while user types description (debounced), pre-fills dropdowns, and allows overrides.
- Stats and ticket list auto-refresh after successful ticket creation.

## Notes

- LLM suggestions require a valid API key.
- Without API key, app still works and returns safe fallback suggestions.
