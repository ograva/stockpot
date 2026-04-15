# ADMN-004 — Platform Dashboard

| Field | Value |
| :--- | :--- |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Sprint** | 1 |
| **Priority** | Med |
| **App** | admin |

## User Statement
As a platform operator, I want a metrics dashboard showing active tenants, platform usage, and health indicators so that I can monitor the StockPot ecosystem at a glance.

## Acceptance Criteria
1. Dashboard at `/admin/dashboard` displays: total active tenants, total suspended tenants, monthly active users (MAU), and total POs generated in the last 30 days.
2. All metrics are sourced from Firestore aggregates computed by a Cloud Function on a scheduled basis (every hour) — not computed client-side on page load.
3. Dashboard displays a "Last updated" timestamp alongside each metric.
4. Dashboard auto-refreshes displayed data every 60 seconds without a full page reload.
5. Each metric card links to the relevant detail list (e.g., "Active Tenants" card links to `/admin/tenants?status=active`).

## data-test-id List
- `admn-dashboard-active-tenants` — active tenant count card
- `admn-dashboard-suspended-tenants` — suspended tenant count card
- `admn-dashboard-mau` — monthly active users card
- `admn-dashboard-po-count` — POs generated last 30 days card
- `admn-dashboard-last-updated` — last updated timestamp
