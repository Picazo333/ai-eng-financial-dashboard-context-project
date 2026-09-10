# Technology stack

## Languages and frameworks

- TypeScript and React 19 are declared in
  [frontend/package.json](../frontend/package.json).
- Vite 8 provides the frontend dev/build tool and proxy in
  [frontend/vite.config.ts](../frontend/vite.config.ts).
- Tailwind CSS is configured through the Vite plugin and frontend styles.
- Python with FastAPI and Pydantic provides the backend API
  ([backend/requirements.txt](../backend/requirements.txt),
  [backend/app/main.py](../backend/app/main.py)).

## Tooling and validation

- Frontend scripts are `dev`, `build`, `lint`, `test`, `test:watch`, and
  `test:coverage` ([frontend/package.json](../frontend/package.json)).
- Frontend tests use Vitest; the current test file is
  [frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts).
- Backend tests use pytest and FastAPI/httpx test support
  ([backend/tests/test_routes.py](../backend/tests/test_routes.py)).
- ESLint and TypeScript configuration are in
  [frontend/eslint.config.js](../frontend/eslint.config.js) and the
  `frontend/tsconfig*.json` files.

## Runtime and infrastructure

- Docker Compose coordinates the frontend and backend services
  ([docker-compose.yml](../docker-compose.yml)).
- The backend image is based on Python 3.13 and runs Uvicorn through debugpy;
  the frontend image is based on Node 24 Alpine
  ([backend/Dockerfile](../backend/Dockerfile),
  [frontend/Dockerfile](../frontend/Dockerfile)).
- Vite proxies `/api` to the Compose service `backend:8000`
  ([frontend/vite.config.ts](../frontend/vite.config.ts)).

No database, persistence layer, authentication mechanism, or production
deployment configuration is evidenced by the current repository.
