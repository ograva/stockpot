# RCNC-002 — Theoretical Deduction Run

| Field | Value |
| :--- | :--- |
| **Module** | RCNC — Reconciliation & Variance Auditing |
| **Sprint** | 3 |
| **Priority** | High |
| **App** | user-app + Cloud Functions |
| **Depends On** | RCNC-001 (confirmed CSV upload), MSTR-007 (full recipe ingredient chain mapped), MSTR-005 (sub-component yield % set) |

## User Statement
As a restaurant owner, I want the system to automatically calculate how much of each raw material was theoretically consumed based on today's confirmed sales so that I have an accurate baseline to compare against the physical count.

## Acceptance Criteria
1. Triggering the deduction run calls a Cloud Function; the computation is not performed client-side.
2. Cloud Function traverses the full ingredient chain for each sold recipe: `quantitySold` × recipe → sub-components → raw materials, applying yield % at each chain link.
3. Deduction result is stored at `restaurants/{restaurantId}/reconciliations/{YYYY-MM-DD}` using `serialize()` with `SCHEMA_VERSION`.
4. Run is idempotent: re-running the deduction for the same date replaces the previous result cleanly without creating duplicate records.
5. A loading state with `data-test-id="rcnc-deduction-running-indicator"` is shown while the Cloud Function executes; a success state confirms completion.
6. If a recipe in the CSV has no ingredient chain mapped (MSTR-007 incomplete), that recipe's deduction is skipped and listed in a "Skipped Items" warning on completion.

## data-test-id List
- `rcnc-deduction-running-indicator` — loading state during Cloud Function execution
- `rcnc-deduction-success-message` — completion confirmation
- `rcnc-deduction-skipped-items-warning` — warning for recipes with incomplete ingredient chains
