# Runtime and generated-data rule

**Scope:** Changes involving startup, Compose, mock data, date ranges, or the
dashboard period label.

Use the Compose service names, ports, and startup commands defined in
[docker-compose.yml](../../docker-compose.yml),
[backend/Dockerfile](../../backend/Dockerfile), and
[frontend/Dockerfile](../../frontend/Dockerfile). The backend data is generated
by `generate_mock_movements(seed=42)` in
[backend/app/routes.py](../../backend/app/routes.py), but its years depend on
`date.today()`. Do not add fixed date assertions or claim a fixed reporting
period without controlling or verifying the clock and API output.

Before changing financial sample data, trace the runtime source from
[frontend/src/App.tsx](../../frontend/src/App.tsx). The static fixture in
[frontend/src/lib/mock-data.ts](../../frontend/src/lib/mock-data.ts) is not
imported by the running app.
