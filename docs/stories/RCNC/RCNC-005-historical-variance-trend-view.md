# RCNC-005 — Historical Variance Trend View

| Field | Value |
| :--- | :--- |
| **Module** | RCNC — Reconciliation & Variance Auditing |
| **Sprint** | 3 |
| **Priority** | Med |
| **App** | user-app |
| **Depends On** | RCNC-003 (multiple reconciliation records must exist over time) |

## User Statement
As a restaurant owner, I want to see variance trends across the past 30 days for each ingredient so that I can identify recurring problem areas that need a systemic fix rather than a one-off adjustment.

## Acceptance Criteria
1. Trend view at `/reconciliation/trends` shows a chart (line or bar) per ingredient with variance % plotted over the selected date range (default last 30 days).
2. Date range is selectable: Last 7 days, Last 30 days, Custom range.
3. Ingredients are filterable by category and sortable by average variance % descending (worst offenders first by default).
4. Clicking on a data point in the trend chart navigates to the specific day's count sheet (RCNC-003) for that date.
5. Only ingredients that have been physically counted at least once appear in the trend view — uncounted ingredients are excluded to avoid misleading zero variance lines.

## data-test-id List
- `rcnc-trends-view` — trends page container
- `rcnc-trends-date-range-select` — date range selector
- `rcnc-trends-category-filter` — category filter
- `rcnc-trends-chart-{ingredientId}` — variance trend chart per ingredient
- `rcnc-trends-ingredient-list` — sortable ingredient list
