---
name: financial-dashboard-verification
description: Verify changes to this inherited React/Vite + FastAPI financial dashboard using its Compose runtime, service-specific checks, and evidence-first repository rules.
---

# Financial Dashboard Verification

Use this skill after changing code, configuration, tests, or agent guidance in this repository.

## Inputs

- The current branch and diff.
- `AGENTS.md`, `.agents/rules/`, and `memory-bank/`.
- The files changed by the task.

## Procedure

1. Read the latest repository guidance before validating.
2. Inspect the diff and identify whether the change affects frontend, backend, or both.
3. Run `docker compose config` to validate the Compose definition.
4. Start the documented runtime with `docker compose up --build -d`.
5. Verify the running application:
   - `curl http://localhost:8000/health` must return `{"status":"ok"}`.
   - `curl -I http://localhost:8000/docs` must return a successful HTTP response.
   - `curl -I http://localhost:5173/` must return a successful HTTP response.
6. Validate the frontend inside the Compose container:
   - `docker compose exec -T frontend npm test -- --run`
   - `docker compose exec -T frontend npm run lint`
   - `docker compose exec -T frontend npm run build`
7. If backend behavior changed, also run `cd backend && python -m pytest tests` in an environment with the declared backend requirements available.
8. Record each check as `PASS`, `FAIL`, or `UNVERIFIED`. Include exact errors for blocked commands.
9. Compare the final evidence against the assignment rubric before opening a pull request.

## Repository-specific guardrails

- Treat Compose as the canonical frontend validation environment. Direct host frontend commands previously failed because `frontend/node_modules` was absent and later root-owned by Docker.
- Preserve the Vite `/api` proxy contract when touching frontend/backend integration.
- Do not claim a fixed reporting year from generated metrics. Backend dates depend on `date.today()` unless the clock or returned API range is explicitly controlled and verified.
- Do not treat the known Vite bundle-size warning as a new failure unless its severity changes or the build fails.
- Never convert `UNVERIFIED` into `PASS` without executable evidence.

## Expected output

Return a compact verification ledger containing:

- command/check;
- observed result;
- `PASS`, `FAIL`, or `UNVERIFIED`;
- any regression or warning introduced by the current change;
- whether the branch is ready for rubric audit and pull request.

## Acceptance criteria

The skill succeeds only when all applicable checks have evidence, failures are explicit, and no claim of completion depends on assumption alone.
