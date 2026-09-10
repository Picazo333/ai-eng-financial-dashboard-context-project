# API contract rule

**Scope:** Changes to backend response models/routes or frontend data loading and
financial types.

The backend movement contract is defined by Pydantic models in
[backend/app/routes.py](../../backend/app/routes.py), while the frontend
duplicates the relevant TypeScript types in
[frontend/src/lib/financial-types.ts](../../frontend/src/lib/financial-types.ts).
When changing a field, enum, route, or response shape, inspect and update both
definitions, the consumer in [frontend/src/App.tsx](../../frontend/src/App.tsx),
and the nearest existing tests. Preserve the `/api` prefix used by the Vite
proxy in [frontend/vite.config.ts](../../frontend/vite.config.ts).

This prevents a backend-only change from silently breaking frontend
calculations or bypassing the development proxy.
