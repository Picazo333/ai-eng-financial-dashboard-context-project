# Current status

## Working and verified

- `docker compose config` succeeds.
- `docker compose up --build -d` starts both services.
- The backend responds to `/health` with `{"status":"ok"}`, serves `/docs`,
  and returns 360 records from `/api/metrics` in the verified run.
- Backend validation passes: `cd backend && python -m pytest tests` reported
  15 passed tests.
- Frontend validation passes inside the running Compose frontend container:
  1 Vitest file with 5 tests, ESLint, and the TypeScript/Vite build. The build
  reports a 584.26 kB minified JavaScript chunk warning.
- The frontend root responds with Vite HTML on port 5173.

These results and the blocked direct-host attempts are recorded in
[verification.md](../verification.md).

## Limitations and uncertainties

- Generated movement years depend on the current date, while the dashboard
  header currently displays `2024 - Full Year`
  ([backend/app/routes.py](../backend/app/routes.py),
  [frontend/src/App.tsx](../frontend/src/App.tsx)). Their alignment is
  unverified.
- Direct host frontend commands initially lacked `node_modules`; a later
  `npm install` was blocked because the Docker-created directory is
  root-owned. The Compose container remains the verified frontend validation
  environment.
- The repository has no evidence of persistent or externally sourced financial
  data.

## Sensible next work

If future work is requested, first resolve the reporting-period/data alignment
and decide whether the static frontend fixture should be removed or explicitly
made part of a tested runtime path. Any API contract change should update both
the backend Pydantic models and frontend TypeScript types.
