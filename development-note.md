# Development note: verified local data flow

The supported local setup is Docker Compose. It starts the `backend` service
on port 8000 and the `frontend` service on port 5173
([docker-compose.yml](./docker-compose.yml)). The browser requests
`/api/metrics` from [frontend/src/App.tsx](./frontend/src/App.tsx); Vite
proxies that path to `http://backend:8000`
([frontend/vite.config.ts](./frontend/vite.config.ts)).

The backend returns generated mock movements rather than persisted records.
`generate_mock_movements(seed=42)` creates 360 records and derives their years
from the current date ([backend/app/routes.py](./backend/app/routes.py)).
