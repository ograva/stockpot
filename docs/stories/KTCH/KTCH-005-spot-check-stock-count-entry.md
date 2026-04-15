# KTCH-005 — Spot-Check Stock Count Entry

| Field | Value |
| :--- | :--- |
| **Module** | KTCH — Kitchen Execution Hub |
| **Sprint** | 2 |
| **Priority** | Med |
| **App** | user-app |

## User Statement
As a kitchen staff member, I want to enter a physical count for a single raw material so that spot-check discrepancies are recorded without needing to run a full inventory count.

## Acceptance Criteria
1. Spot-check count accessible at `/kitchen/spot-count`; available to both `staff` and `manager` roles.
2. Staff searches for a raw material and enters the physically counted quantity using a tap control or numeric input.
3. The counted quantity is written as the new `currentStock` value (not an adjustment delta — this is an absolute count override).
4. The previous stock value and the variance (counted minus previous) are shown on a confirmation screen before the final save.
5. Spot-check entries are logged to the same `adjustmentLog` collection as KTCH-004, with `reason: 'SPOT_COUNT'` and the variance amount recorded.
6. If the variance exceeds 10% of the par minimum, a warning prompts the staff member to call a manager before confirming.

## data-test-id List
- `ktch-spotcount-ingredient-search` — ingredient search
- `ktch-spotcount-qty-decrease` — quantity decrease
- `ktch-spotcount-qty-increase` — quantity increase
- `ktch-spotcount-qty-value` — counted quantity display
- `ktch-spotcount-previous-stock` — previous stock display on confirmation
- `ktch-spotcount-variance-display` — variance display on confirmation
- `ktch-spotcount-variance-warning` — high-variance warning
- `ktch-spotcount-confirm-button` — confirm and save button
