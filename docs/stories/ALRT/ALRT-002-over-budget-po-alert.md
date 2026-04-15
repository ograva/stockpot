# ALRT-002 — Over-Budget PO Alert

| Field | Value |
| :--- | :--- |
| **Module** | ALRT — Alert Engine |
| **Sprint** | 3 |
| **Priority** | High |
| **App** | user-app + Cloud Functions |
| **Depends On** | REPO-004 (PO submission must exist) |

## User Statement
As a restaurant owner, I want to be alerted when a submitted purchase order's total cost would exceed my configured weekly purchasing budget so that I can review before approving and avoid unplanned overspend.

## Acceptance Criteria
1. Owner sets a weekly purchasing budget at `/settings/budget`; stored at `restaurants/{restaurantId}/settings/budget` as `weeklyBudget` (in PHP).
2. When a PO is submitted for approval (REPO-004), a Cloud Function compares the PO total against the remaining weekly budget (total budget minus sum of all `APPROVED`/`DISPATCHED` PO totals in the current week).
3. If the PO total would exceed the remaining budget, the PO status is set to `PENDING_REVIEW` (not blocked — owner can still approve) and an in-app notification is generated.
4. The budget alert notification includes: PO total, remaining budget, the resulting overrun amount, and a direct deep link to the PO for review.
5. Owner can acknowledge the over-budget state and approve anyway; acknowledgment is logged to the `auditLog` with the owner's UID and timestamp.

## data-test-id List
- `alrt-budget-input` — weekly budget input in settings
- `alrt-budget-save-button` — save budget button
- `alrt-budget-remaining-display` — remaining budget display in PO approval view
- `alrt-budget-overrun-warning` — over-budget warning on PO detail
- `alrt-budget-acknowledge-checkbox` — owner acknowledgment checkbox
