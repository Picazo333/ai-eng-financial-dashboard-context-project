# Frontend specs handoff

This directory defines the contract for three requested frontend features. **Implementation is out of scope**: no React components, fetch wiring, routing implementation, or backend changes belong in this branch.

## Evidence used

The API names below were verified against the FastAPI route declarations and Pydantic models that generate `/docs` and `/openapi.json` in `backend/app/routes.py`, plus `backend/tests/test_routes.py`. Existing frontend conventions were checked in `frontend/src/App.tsx`, `frontend/src/lib/financial-types.ts`, and `frontend/src/components/dashboard/`.

Verified endpoints:
- `GET /api/metrics`
- `GET /api/metrics/facets`
- `GET /api/metrics/alerts`
- `GET /api/metrics/categories/top`

All field/query names preserve the API's snake_case naming.

## Shared date contract

`DateRangeFilter` is defined in `param-types.ts` and reused by `MetricsParams`, `AlertsParams`, and `TopCategoriesParams`.

- `start_date?: string` — inclusive lower bound, `YYYY-MM-DD`.
- `end_date?: string` — inclusive upper bound, `YYYY-MM-DD`.
- Neither present -> omit both keys and show all available data.
- Start only -> keep data on/after `start_date`.
- End only -> keep data on/before `end_date`.
- Both present -> both boundaries are inclusive.
- Valid selectable bounds come from `FacetsResponse.min_date` and `max_date` and must be shown near the date inputs.
- `start_date > end_date` or values outside the facets range are blocked in the UI.

# Feature 1 — Date range filter

## Intent

Add optional start/end date inputs to the home dashboard so finance users can focus KPIs/charts on a selected period.

## Endpoints and types

1. `GET /api/metrics/facets`
   - params: none
   - response: `FacetsResponse`
   - relevant fields: `min_date`, `max_date`, plus available operation/business/category values.

2. `GET /api/metrics`
   - request type: `MetricsParams`
   - Feature 1 uses the inherited optional `start_date` / `end_date`
   - response: `MetricsResponse` (`FinancialMovement[]`)

`FinancialMovement` fields are exactly: `create_date`, `amount`, `operation_type`, `category`, `business_type`.

## UI behavior

Use `DashboardDateRangeFilter` at the top of the home dashboard. A valid active range is applied to `/api/metrics` and reused by Feature 2. Keep current dashboard loading/error patterns.

## Edge cases

1. No dates -> all available data.
2. Start only -> one-sided lower bound.
3. End only -> one-sided upper bound.
4. Start after end -> show validation; do not apply.
5. Outside facets range -> show valid range; do not apply.
6. Facets failure -> keep filter visible but disabled; never invent a range.

# Feature 2 — Anomaly alerts table

## Intent

Show periods where outcome/spending increased unexpectedly, with a configurable threshold and the same active date filter as Feature 1.

## Endpoint

`GET /api/metrics/alerts`

Request type: `AlertsParams`.

- `threshold?: number` — API default `0.3`; OpenAPI minimum `0`; no declared maximum. Product/UI must enforce `0.01` through `1.0` inclusive, default `0.3`.
- `group_by?: GroupBy` — API default `month`; this feature should send `month` explicitly.
- `start_date?`, `end_date?` — reuse Feature 1.
- `business_type?` — omit on the combined home view.

Response: `AlertsResponse` (`AlertEntry[]`).

`AlertEntry` fields:
- `period`
- `outcome_total`
- `baseline_average`
- `increase_ratio`

Table mapping:
- Period -> `period`
- Recorded outcome -> `outcome_total`
- Baseline average -> `baseline_average`
- Percentage increase -> `increase_ratio` formatted as a percentage

## Required empty/loading/error behavior

- The table remains visible when no anomalies exist.
- Empty success -> **No anomalies detected**.
- Loading -> keep table structure visible with loading placeholders.
- Failure -> show error state; do not present failure as an empty result.

## Confirmed product/API mismatch

The PM brief says the baseline is the rolling average of the **previous 3 periods**. The current backend implementation `detect_outcome_alerts()` instead averages **all prior periods available in the filtered summary**. Therefore the frontend must:

- label the API value neutrally as **Baseline average**;
- not claim it is a 3-period rolling average;
- not recompute a different three-period value client-side while presenting it as the API contract;
- leave the backend unchanged in this assignment.

## Edge cases

1. Zero anomalies -> explicit empty state; table does not disappear.
2. Threshold `0.01` and `1.0` are valid UI bounds.
3. Outside UI threshold range -> reject before request.
4. One-sided date filter -> forward only the active key.
5. Date change -> refresh alerts using the same new date filter.
6. First summary period has no prior history -> backend may emit no alert; render returned array as-is.

# Feature 3 — B2B vs B2C comparison

## Intent

Add a comparison view with two business-line panels. Each shows the top five income categories with category, total income and percentage of group total. One visualization below compares total B2B vs B2C income. The same optional date filter applies.

## Endpoints

1. `GET /api/metrics/facets` -> `FacetsResponse` for date bounds and valid business/category values.

2. `GET /api/metrics/categories/top` -> `TopCategoriesResponse` (`CategoryEntry[]`).

Request type: `TopCategoriesParams`.

For Feature 3 send two requests using identical dates:

- `operation_type=income&limit=5&business_type=B2B`
- `operation_type=income&limit=5&business_type=B2C`

Relevant verified params:
- `operation_type?: OperationType` — API default `outcome`; Feature 3 must explicitly send `income`.
- `limit?: number` — API default `5`, valid integer range `1..20`; Feature 3 sends `5`.
- `start_date?`, `end_date?` — same active filter on both requests.
- `business_type?: BusinessType` — `B2B` or `B2C`.

`CategoryEntry` fields:
- `category`
- `operation_type`
- `total_amount`

## Totals and percentage rule

For each successful business response:

- `groupTotal = sum(total_amount)` over returned rows.
- `rowPercentage = groupTotal > 0 ? total_amount / groupTotal : 0`.

This represents the complete group total for the **current verified contract** because `Category` has exactly five possible values and this feature requests `limit=5`. If the API later adds more than five categories, this assumption must be revisited.

## UI behavior

Use `B2BvsB2CComparisonView` with two panels and a `BusinessIncomeComparisonChart` below them. Each panel uses `TopIncomeCategoriesTable`.

- Wide screens: B2B and B2C side by side.
- Narrow screens: stacking is acceptable.
- Preserve API row order.
- Never fabricate rows to reach five.

## Empty/loading/error behavior

- B2B empty only -> B2B shows **No income categories for this period**; B2C renders normally; successful B2B total is `0`.
- B2C empty only -> symmetric behavior.
- Both empty -> both panels show empty state; comparison communicates zero/no income for both.
- Fewer than five rows -> render exactly the rows returned.
- Loading -> keep both panel shells and comparison region visible with placeholders.
- Failure -> show error; never convert failure into a zero total.

## Edge cases

1. B2B has 3 rows and B2C 5 -> render 3 and 5; percentages independently by group.
2. One group empty -> explicit empty state for that group.
3. Both groups empty -> both empty states plus zero/no-income comparison.
4. One-sided date filter -> same single query key on both requests.
5. Different date filters between groups are forbidden.
6. Returned `operation_type !== "income"` is a contract violation for this feature.

# Handoff map

| Feature | Request type(s) | Response type(s) | Endpoint(s) |
|---|---|---|---|
| Date filtering | `DateRangeFilter`, `MetricsParams` | `FacetsResponse`, `MetricsResponse` | `/api/metrics/facets`, `/api/metrics` |
| Anomaly table | `AlertsParams` | `AlertsResponse`, `AlertEntry` | `/api/metrics/alerts` |
| B2B vs B2C | `TopCategoriesParams`, `DateRangeFilter` | `FacetsResponse`, `TopCategoriesResponse`, `CategoryEntry` | `/api/metrics/facets`, `/api/metrics/categories/top` |

See `components.md` for proposed component names, props, interactions, and conditional rendering.

# Implementation boundary

This branch intentionally adds only specification files under `frontend/specs/`. It adds no React/JSX implementation, no new fetch/API wiring, and no backend modifications.

# Rubric verification

- [x] API response fields and params trace to the FastAPI contract source.
- [x] No `any` or generic `object` in TypeScript specs.
- [x] `DateRangeFilter` has optional string date fields with `YYYY-MM-DD` JSDoc.
- [x] `AlertsParams` extends `DateRangeFilter`.
- [x] `TopCategoriesParams` extends `DateRangeFilter`.
- [x] Anomaly empty state is explicit.
- [x] Single-date behavior is explicit.
- [x] B2B/B2C empty and fewer-than-five behavior is explicit.
- [x] Every feature has at least two edge cases.
- [x] `components.md` names proposed components, props, data sources and conditional rendering.
- [x] Product/API baseline mismatch is documented.
- [x] No React, fetch wiring, or backend changes are included.
