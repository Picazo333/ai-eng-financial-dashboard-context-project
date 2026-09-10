# Engineering findings

These findings describe patterns observed in the current implementation. They
are repository-specific and are intended to guide future agent changes without
redesigning the application.

## 1. The frontend API contract is split across runtime and TypeScript definitions

- **Finding:** Backend Pydantic models and frontend TypeScript types both define
  the movement contract. API changes must update both sides.
- **Evidence:** `FinancialMovement` is defined in
  [backend/app/routes.py](./backend/app/routes.py), while the corresponding
  `FinancialMovement`, `OperationType`, `Category`, and `BusinessType` types
  are defined in [frontend/src/lib/financial-types.ts](./frontend/src/lib/financial-types.ts).
  The fetch boundary is in [frontend/src/App.tsx](./frontend/src/App.tsx).
- **Why it matters:** A backend response can remain HTTP-valid while becoming
  incompatible with frontend calculations or chart rendering.
- **Possible agent rule:** When changing a movement field, enum value, or API
  response shape, inspect and update the matching frontend type, calculation,
  and test coverage in the same change; do not assume the Python model is the
  only contract.

## 2. The frontend uses a Vite proxy by default and must preserve the `/api` path

- **Finding:** Browser requests are relative by default, and Vite owns the
  development proxy to the Compose backend hostname.
- **Evidence:** `App.tsx` builds `${VITE_API_BASE_URL}/api/metrics`
  ([frontend/src/App.tsx](./frontend/src/App.tsx)); the proxy maps `/api` to
  `http://backend:8000` ([frontend/vite.config.ts](./frontend/vite.config.ts));
  the override is documented in [frontend/.env.example](./frontend/.env.example).
- **Why it matters:** Calling `http://backend:8000` directly from browser code
  would fail for normal host browsing, while removing `/api` would bypass the
  configured proxy.
- **Possible agent rule:** Keep frontend API calls relative and rooted at
  `/api` unless the environment override is intentionally being changed; if a
  route changes, update the Vite proxy assumptions and backend tests together.

## 3. Backend data is generated mock data whose date range moves with the clock

- **Finding:** Every API handler regenerates the same seeded 360-record data
  set, but the record years are derived from `date.today()`.
- **Evidence:** `generate_mock_movements(seed=42)` is called by each route in
  [backend/app/routes.py](./backend/app/routes.py); `_year_for_month` uses
  `today.year` and `today.month` in the same file. The existing test asserts
  count and sorting but does not freeze the date
  ([backend/tests/test_routes.py](./backend/tests/test_routes.py)).
- **Why it matters:** Date-sensitive tests, documentation examples, and the
  frontend's hard-coded `2024 - Full Year` header can become misleading as time
  passes.
- **Possible agent rule:** Treat generated dates as runtime-dependent. Do not
  add fixed-date expectations without controlling the clock, and verify any
  displayed period against the API date range.

## 4. The frontend contains a legacy-looking static fixture that is not the API source

- **Finding:** A substantial `mockMovements` fixture contains 2024 records, but
  the current app fetches `/api/metrics` and does not import that fixture.
- **Evidence:** The fixture is exported from
  [frontend/src/lib/mock-data.ts](./frontend/src/lib/mock-data.ts); the only
  application fetch is in [frontend/src/App.tsx](./frontend/src/App.tsx), and
  the app imports types/utilities rather than `mockMovements`.
- **Why it matters:** An agent could update or use the fixture and believe it
  changes the running dashboard, creating two conflicting data sources.
- **Possible agent rule:** Before changing financial sample data, trace imports
  from `frontend/src/App.tsx` and the backend routes. Treat
  `frontend/src/lib/mock-data.ts` as non-runtime unless an explicit import is
  added and tested.

## 5. Validation is split between backend pytest and frontend npm scripts

- **Finding:** The repository has separate validation entry points rather than
  one root command.
- **Evidence:** Backend tests are under
  [backend/tests/test_routes.py](./backend/tests/test_routes.py) and dependencies
  are listed in [backend/requirements.txt](./backend/requirements.txt).
  Frontend `test`, `build`, and `lint` scripts are in
  [frontend/package.json](./frontend/package.json), with ESLint configuration in
  [frontend/eslint.config.js](./frontend/eslint.config.js). The root has no
  `package.json`.
- **Why it matters:** Running npm commands from the repository root gives an
  unrelated `package.json`-missing error, and a change can pass one side's
  checks while breaking the other.
- **Possible agent rule:** Run backend checks from `backend/` and frontend
  checks from `frontend/`; for cross-stack changes, run both sets plus the
  Docker Compose health checks.

## 6. Compose is the verified integrated runtime, and its service names are part of the setup

- **Finding:** The Dockerfiles install each service's dependencies and Compose
  supplies the `backend` hostname used by Vite.
- **Evidence:** [docker-compose.yml](./docker-compose.yml) defines service names,
  mounts, and ports; [backend/Dockerfile](./backend/Dockerfile) and
  [frontend/Dockerfile](./frontend/Dockerfile) define installation/startup.
  The README documents Compose as the local execution method
  ([README.md](./README.md)).
- **Why it matters:** Changing service names, ports, or the Vite target can
  break the only verified end-to-end setup even if isolated unit tests pass.
- **Possible agent rule:** Preserve the Compose service/port contract when
  making runtime changes, and validate with `docker compose config`, startup,
  `/health`, `/docs`, and the frontend root.
