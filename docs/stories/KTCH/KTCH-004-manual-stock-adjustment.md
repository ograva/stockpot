# KTCH-004 — Manual Stock Adjustment

| Field | Value |
| :--- | :--- |
| **Module** | KTCH — Kitchen Execution Hub |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | user-app |
| **Access** | `manager` role only (staff cannot make adjustments) |

## User Statement
As a kitchen manager, I want to manually adjust the stock count of a raw material with a required reason code so that inventory stays accurate after spoilage, spillage, or counting errors.

## Acceptance Criteria
1. Manual adjustment accessible at `/kitchen/adjustments`; restricted to `manager` role.
2. Manager searches for a raw material and enters an adjustment quantity (positive = stock added, negative = stock removed).
3. A reason code is required before saving: `SPOILAGE`, `SPILLAGE`, `COUNT_CORRECTION`, `OTHER`.
4. If `OTHER` is selected, a free-text note field is required (minimum 10 characters).
5. Adjustment is written to `restaurants/{restaurantId}/adjustmentLog/{adjustmentId}` with: timestamp, userId, ingredientId, adjustmentQty, reason code, and note.
6. Adjustments are not deletable. Corrections are made by creating a new offsetting adjustment.

## data-test-id List
- `ktch-adjustment-ingredient-search` — ingredient search input
- `ktch-adjustment-qty-input` — adjustment quantity input
- `ktch-adjustment-reason-select` — reason code selector
- `ktch-adjustment-note-input` — free-text note (required for OTHER)
- `ktch-adjustment-note-error` — validation error for missing note
- `ktch-adjustment-save-button` — save adjustment button
- `ktch-adjustment-confirm-dialog` — confirmation dialog before saving
