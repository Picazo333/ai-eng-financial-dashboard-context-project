# Frontend component specifications

Specification only: do not add React components, fetch calls, routing implementation, or backend changes in this assignment branch.

## Shared date rules

- API query keys are `start_date` and `end_date`.
- Values use `YYYY-MM-DD`; both are optional and inclusive.
- `GET /api/metrics/facets` provides `min_date` and `max_date`; show this available range beside the inputs.
- Neither date: omit both query keys and show all available data.
- Start only: send only `start_date`; backend keeps records on/after it.
- End only: send only `end_date`; backend keeps records on/before it.
- `start_date > end_date` or a value outside the facets range: show validation and do not apply the invalid filter.
- The same active range is reused by the home metrics request, alerts request, and both B2B/B2C requests.

## `DashboardDateRangeFilter`

Purpose: two date inputs at the top of the home dashboard.

Props:
- `value: DateRangeFilter`
- `minDate: FacetsResponse["min_date"]`
- `maxDate: FacetsResponse["max_date"]`
- `loading: boolean`
- `error: string | null`
- `onChange: (next: DateRangeFilter) => void`

Data: `GET /api/metrics/facets`; resulting filter is applied to `GET /api/metrics`.

Rendering/behavior:
- Labels: **Start date** and **End date**.
- Show `Available: {minDate} to {maxDate}` when facets load.
- Empty input means omit that query key, never send an empty string.
- One valid date may be applied without requiring the second.
- While facets load, disable inputs and show a loading indication.
- If facets fail, keep the filter visible but disabled and show the error; never invent a range.

Edge cases:
1. Start only -> one-sided lower-bound filter.
2. End only -> one-sided upper-bound filter.
3. Both blank -> all available data.
4. Start after end -> inline validation, no update.
5. Outside `min_date`/`max_date` -> inline validation, no update.

## `ThresholdInput`

Purpose: configure Feature 2 anomaly threshold.

Props:
- `value: number`
- `disabled: boolean`
- `onChange: (next: number) => void`

Rules:
- Default `0.3`.
- Product/UI valid range `0.01` through `1.0`, inclusive; recommended step `0.01`.
- API itself accepts `threshold >= 0` and declares no maximum; the UI is intentionally stricter.
- Invalid transient values show an inline message and are not applied.

## `AnomalyAlertsTable`

Purpose: anomaly table below existing home-dashboard charts.

Props:
- `alerts: AlertsResponse`
- `threshold: number`
- `dateRange: DateRangeFilter`
- `loading: boolean`
- `error: string | null`

Request: `GET /api/metrics/alerts` with active `threshold`, explicit `group_by=month`, active date keys when present, and no `business_type` for the combined home view.

Columns:
- Period -> `period`
- Recorded outcome -> `outcome_total`
- Baseline average -> `baseline_average`
- Percentage increase -> `increase_ratio` formatted as a percentage

Important mismatch: the PM brief says the baseline is the previous 3 periods, but `backend/app/routes.py::detect_outcome_alerts` averages **all prior periods available in the filtered summary**. Do not label the returned field as "previous 3 periods" and do not recompute a different value client-side. Use **Baseline average** and leave the backend unchanged.

Conditional rendering:
- Loading: keep heading/columns visible with loading rows/placeholders.
- Error: keep section visible and show an error state.
- Successful empty array: keep table visible and show **No anomalies detected**.
- Rows present: render one row per `AlertEntry` in API order.

Edge cases:
1. Zero anomalies -> explicit empty state; table does not disappear.
2. Threshold `0.01` and `1.0` are valid; outside values are blocked by `ThresholdInput`.
3. One-sided date filter is forwarded unchanged.
4. Changing date range changes the history used by the backend baseline; render returned values without recalculating a three-period baseline.
5. Request failure is an error state, not an empty state.

## `B2BvsB2CComparisonView`

Purpose: new comparison page/view with B2B and B2C panels plus one total-income comparison visualization.

Props:
- `dateRange: DateRangeFilter`
- `facets: FacetsResponse`
- `b2bCategories: TopCategoriesResponse`
- `b2cCategories: TopCategoriesResponse`
- `loading: boolean`
- `error: string | null`

Required requests (same date range on both):
- `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B`
- `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C`

Layout:
- Two side-by-side panels on wide screens; stacking on narrow screens is acceptable.
- Below them render `BusinessIncomeComparisonChart`.
- Reuse the same date-filter contract and facets range as Feature 1.

Derivation per business group:
- `groupTotal = sum(row.total_amount)` over the returned response.
- `rowPercentage = groupTotal > 0 ? row.total_amount / groupTotal : 0`.
- This is a complete group total for the **current verified contract** because `Category` has exactly five possible values and Feature 3 requests `limit=5`. If the API later adds more categories, this assumption must be revisited.

Conditional rendering:
- B2B empty only -> B2B shows **No income categories for this period**; B2C renders normally; successful B2B total is 0.
- B2C empty only -> symmetric behavior.
- Both empty -> both panels show empty state and comparison communicates zero/no income for both.
- Fewer than five -> render exactly the returned rows; never fabricate rows.
- Loading -> keep both panels and chart region visible with placeholders.
- Failure -> show an error; do not convert a failed request into a zero total.

Edge cases:
1. B2B returns 3 rows and B2C 5 -> render 3 and 5, percentages independently by group.
2. One group returns `[]` -> explicit empty state for that group.
3. Both groups return `[]` -> both empty states plus zero/no-income comparison.
4. One-sided date filter -> same single query key on both requests.
5. A returned `operation_type` other than `income` is a contract violation; do not reinterpret it.

## `TopIncomeCategoriesTable`

Purpose: category ranking for one business line.

Props:
- `businessType: BusinessType`
- `rows: TopCategoriesResponse`
- `groupTotal: number`
- `loading: boolean`
- `error: string | null`

Columns: Category (`category`), Total income (`total_amount`), % of group total (`total_amount / groupTotal`). Preserve API order. Render zero through five real rows only.

## `BusinessIncomeComparisonChart`

Purpose: visual comparison of total B2B income versus total B2C income.

Props:
- `totals: Record<BusinessType, number>`
- `loading: boolean`
- `error: string | null`

Rules:
- Exactly two labelled values: B2B and B2C.
- Use dashboard currency formatting.
- Chart primitive may follow existing dashboard conventions.
- Both successful totals zero -> keep both labels visible and communicate no income in the selected period.
- Failure -> error state, not zero-valued bars.
