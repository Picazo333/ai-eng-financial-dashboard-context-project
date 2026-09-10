# Validation workflow rule

**Scope:** Any code or configuration change.

Run checks from the service directory that owns them: backend tests from
`backend/` using the requirements in
[backend/requirements.txt](../../backend/requirements.txt), and frontend
scripts from `frontend/` using
[frontend/package.json](../../frontend/package.json). The repository root has
no package manifest. For changes crossing the service boundary, additionally
run `docker compose config`, start the documented Compose setup, and check
`/health`, `/docs`, and the frontend root.

Record blocked commands and their exact errors instead of treating an
unavailable local dependency as a passing check.
