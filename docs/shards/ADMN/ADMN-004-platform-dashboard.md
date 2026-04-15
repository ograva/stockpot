# ADMN-004 — Platform Dashboard

| Field | Value |
| :--- | :--- |
| **Shard ID** | ADMN-004 |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Story Ref** | ADMN-004 |
| **Priority** | Medium |
| **Status** | Completed |
| **Complexity** | M |
| **Depends On** | ADMN-002, ADMN-003 |

## Description
Build the platform operator dashboard (`/dashboard`), the first screen seen after admin login. It displays high-level KPI cards: total active tenants, tenants by subscription tier (chart), newly onboarded this month, and platform supplier catalog freshness. Charts use `ng-apexcharts`. All data is read client-side from Firestore with no custom aggregation Cloud Function required for v1.

## Acceptance Criteria
- [ ] KPI cards display: active tenants count, suspended tenants count, tenants per subscription tier.
- [ ] Donut or bar chart visualizes tier distribution using `ng-apexcharts`.
- [ ] "Recently Added Tenants" list shows the 5 newest restaurants (ordered by `createdAt` desc).
- [ ] All metrics read via `AdminCoreService` signal or `TenantService` — no direct Firestore queries in the component.
- [ ] Dashboard is the default route `/` within `FullComponent` layout.

## Test Coverage
- [ ] **Unit:** `TenantService.getActiveTenantCount()` — mock Firestore collection snapshot; assert computed count.
- [ ] **E2E (T115):** `e2e/admin/flows/splash/` — Login; confirm dashboard loads with at least one KPI card visible.

## Dev Notes
- **Files to create/edit:**
  - `projects/admin/src/app/pages/dashboard/dashboard.component.ts` + `.html`
- **Charts:** Use `ng-apexcharts` (already in tech stack per `Architecture.md`). Import `NgApexchartsModule` in `MaterialModule` or as a direct import in the standalone component.
- **Performance:** Do NOT run Firestore aggregation in component `ngOnInit`. Use `TenantService` computed signals instead.
