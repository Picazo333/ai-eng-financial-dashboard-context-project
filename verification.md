# Verification ledger

This ledger records repository evidence and executable checks performed during
Phase 1. Claims are marked `VERIFIED`, `WRONG`, or `UNVERIFIED`; uncertain
behavior is not presented as fact.

| Claim | Status | Repository evidence | Verification or correction |
| --- | --- | --- | --- |
| The project is a financial metrics dashboard with a React + TypeScript frontend and FastAPI backend. | VERIFIED | [README.md](./README.md) | Matches the frontend package and backend application files. |
| The application has separate frontend and backend Compose services. | VERIFIED | [docker-compose.yml](./docker-compose.yml) | `docker compose config` succeeded and showed both services. |
| The documented local startup command is `docker compose up --build`. | VERIFIED | [README.md](./README.md) | `docker compose up --build -d` completed successfully in this environment. |
| The backend health endpoint is available at `/health`. | VERIFIED | [backend/app/routes.py](./backend/app/routes.py) | `curl http://localhost:8000/health` returned `{"status":"ok"}`. |
| FastAPI API documentation is available at `/docs`. | VERIFIED | [backend/app/main.py](./backend/app/main.py) | `curl http://localhost:8000/docs` returned HTTP 200. |
| The metrics API returns generated movements. | VERIFIED | [backend/app/routes.py](./backend/app/routes.py) | `curl http://localhost:8000/api/metrics` returned 360 records; the first and last dates were `2025-09-02` and `2026-08-28` in this run. |
| The frontend serves successfully through the documented Compose setup. | VERIFIED | [frontend/Dockerfile](./frontend/Dockerfile), [docker-compose.yml](./docker-compose.yml) | `curl http://localhost:5173/` returned Vite HTML and container logs showed Vite ready on port 5173. |
| Backend tests are available and pass. | VERIFIED | [backend/tests/test_routes.py](./backend/tests/test_routes.py), [backend/requirements.txt](./backend/requirements.txt) | After installing the declared backend requirements, `cd backend && python -m pytest tests` passed 15 tests with one deprecation warning. |
| Frontend test/build/lint commands can run directly in the checked-out host tree without setup. | WRONG | [frontend/package.json](./frontend/package.json), [.gitignore](./.gitignore) | Direct commands initially failed with `vitest: not found`, `tsc: not found`, and `eslint: not found` because ignored `frontend/node_modules` was absent. The Dockerfile installs dependencies, and Docker startup was verified. |
| The frontend always displays data for the period shown in its header. | UNVERIFIED | [frontend/src/App.tsx](./frontend/src/App.tsx), [backend/app/routes.py](./backend/app/routes.py) | The header says `2024 - Full Year`, while generated records are based on `date.today()`; no alignment contract is implemented. |
| The backend has a root `/` endpoint. | WRONG | [backend/app/routes.py](./backend/app/routes.py) | The running backend returned HTTP 404 for `/`; supported documented endpoints are `/health`, `/api/metrics`, and `/docs` plus the other routes in `routes.py`. |

## Commands run

- `docker compose config` — passed.
- `docker compose up --build -d` — passed; both containers reported running.
- `curl http://localhost:8000/health` — passed.
- `curl http://localhost:8000/api/metrics` — passed with 360 records.
- `curl http://localhost:8000/docs` — passed with HTTP 200.
- `curl http://localhost:5173/` — passed with Vite HTML.
- `cd backend && python -m pytest tests` — passed: 15 tests.
- Direct frontend `npm test -- --run`, `npm run build`, and `npm run lint` — blocked by absent `frontend/node_modules`; exact tool-not-found errors are recorded above.
