# Project summary

## Purpose

This repository contains a financial metrics dashboard. The repository README
describes it as a React + TypeScript frontend backed by a FastAPI service
([README.md](./README.md)).

The backend currently serves deterministic, generated mock financial movements:
`generate_mock_movements(seed=42)` creates 360 records and the API exposes
health, metrics, filtering, summaries, comparisons, alerts, category, B2B, and
B2C endpoints ([backend/app/routes.py](./backend/app/routes.py)). There is no
database or external data source referenced by the implementation.

## Architecture and important paths

- `backend/app/main.py` creates the FastAPI application and includes the
  router.
- `backend/app/routes.py` defines the Pydantic response models, mock-data
  generation, filtering/aggregation helpers, and API routes.
- `backend/tests/` contains the backend pytest suite.
- `frontend/src/main.tsx` is the browser entry point and
  `frontend/src/App.tsx` composes the dashboard.
- `frontend/src/components/dashboard/` contains the dashboard header, KPI
  cards, and charts.
- `frontend/src/lib/financial-utils.ts` computes KPI and monthly chart values;
  its behavior is covered by
  `frontend/src/lib/financial-utils.test.ts`.
- `docker-compose.yml` defines the `backend` and `frontend` services.

The backend image uses Python 3.13 and starts Uvicorn through debugpy
([backend/Dockerfile](./backend/Dockerfile)). The frontend image uses Node 24,
installs the declared npm dependencies, and starts Vite
([frontend/Dockerfile](./frontend/Dockerfile)).

## Frontend/backend connection

`frontend/src/App.tsx` requests `${VITE_API_BASE_URL}/api/metrics`. With the
default empty base URL, the browser requests `/api/metrics`. Vite proxies that
path to `http://backend:8000` as configured in
[frontend/vite.config.ts](./frontend/vite.config.ts). The compose file places
both services on the same default network and publishes ports 5173 and 8000
([docker-compose.yml](./docker-compose.yml)).

## How to run

The documented execution method is:

```bash
docker compose up --build
```

This command is documented in [README.md](./README.md). In the verified
environment, `docker compose up --build -d` started both containers. The
frontend was reachable at `http://localhost:5173`, the backend health endpoint
at `http://localhost:8000/health`, and FastAPI documentation at
`http://localhost:8000/docs`.

For direct development, the available scripts are in
[frontend/package.json](./frontend/package.json): `dev`, `build`, `lint`,
`test`, `test:watch`, and `test:coverage`. Backend dependencies and its
pytest-compatible test tools are listed in
[backend/requirements.txt](./backend/requirements.txt); the backend Docker
command is the executable startup definition.

## Known uncertainties

- The frontend is intended to show a 2024 full-year period in
  `DashboardHeader`, but the backend mock generator derives its 12-month range
  from the current date ([frontend/src/App.tsx](./frontend/src/App.tsx) and
  [backend/app/routes.py](./backend/app/routes.py)). The relationship between
  that label and the generated data is therefore unverified.
- Direct host frontend commands could not run before installing frontend
  dependencies because `frontend/node_modules` is ignored and absent in the
  checked-out tree. The Docker-based frontend did run successfully.
- No production deployment, persistent storage, authentication, or external
  financial-data integration is evidenced by the repository.
