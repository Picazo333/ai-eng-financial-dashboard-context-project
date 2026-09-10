# Product

This repository implements a financial metrics dashboard. The React
application displays income, outcome, profit, and profit-margin KPIs plus
monthly charts ([frontend/src/App.tsx](../frontend/src/App.tsx),
[frontend/src/components/dashboard](../frontend/src/components/dashboard)).

The current backend does not connect to a financial database or external
provider. It generates 360 seeded mock movements and exposes filtering and
summary-oriented API endpoints
([backend/app/routes.py](../backend/app/routes.py)). The frontend loads
`/api/metrics`, computes the KPI and monthly chart values, and renders them.
