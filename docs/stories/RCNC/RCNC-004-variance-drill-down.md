# RCNC-004 — Variance Drill-Down

| Field | Value |
| :--- | :--- |
| **Module** | RCNC — Reconciliation & Variance Auditing |
| **Sprint** | 3 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | RCNC-003 (count sheet with variance data must exist) |

## User Statement
As a restaurant owner, I want to click into a variance-flagged raw material and see which recipe contributed most to the discrepancy so that I can investigate the root cause — whether it's waste, a prep error, or a recipe that needs adjusting.

## Acceptance Criteria
1. Clicking an amber or red variance row in the count sheet (RCNC-003) expands an inline drill-down panel — no page navigation required.
2. Drill-down shows the contributing chain: raw material → sub-component(s) that consumed it → recipe(s) that contained those sub-components → POS quantities sold for each recipe.
3. Each chain link shows the theoretical amount it contributed to the total deduction for that ingredient.
4. Drill-down is exportable to CSV for off-system investigation (e.g., presenting to kitchen staff in a morning meeting).
5. A "Log Adjustment" shortcut button in the drill-down opens the manual stock adjustment flow (KTCH-004), pre-filled with the ingredient and the variance amount.

## data-test-id List
- `rcnc-variance-drilldown-{ingredientId}` — expandable drill-down panel per ingredient
- `rcnc-drilldown-chain-list-{ingredientId}` — linked chain list (raw material → sub-component → recipe)
- `rcnc-drilldown-export-csv-{ingredientId}` — export drill-down to CSV
- `rcnc-drilldown-log-adjustment-{ingredientId}` — shortcut to KTCH-004 stock adjustment
