# REPO-003 — Manual PO Creation & Editing

| Field | Value |
| :--- | :--- |
| **Module** | REPO — Smart PO & Replenishment Engine |
| **Sprint** | 2 |
| **Priority** | Med |
| **App** | user-app |

## User Statement
As a kitchen manager, I want to create a purchase order manually and edit its line items so that I can handle ad-hoc or non-par-driven orders.

## Acceptance Criteria
1. "New PO" button at `/replenishment/new` opens a blank PO form where manager selects a supplier and adds line items one by one.
2. Line item entry: search for ingredient (from restaurant's ingredient list), enter quantity, UoM auto-fills from ingredient config, price auto-fills from supplier catalog.
3. PO total is calculated and displayed in real time as line items are added or modified.
4. Manager can save the PO as `DRAFT` at any time and return to it later.
5. Manager can delete a `DRAFT` PO; once submitted (`PENDING_APPROVAL`) deletion is blocked.

## data-test-id List
- `repo-new-po-button` — new manual PO button
- `repo-manual-po-form` — manual PO form
- `repo-manual-po-supplier-select` — supplier selector
- `repo-manual-po-add-line-button` — add line item button
- `repo-manual-po-ingredient-search-{index}` — ingredient search per row
- `repo-manual-po-quantity-{index}` — quantity input per row
- `repo-manual-po-total` — running PO total
- `repo-manual-po-save-draft-button` — save as draft button
- `repo-manual-po-delete-button` — delete draft button
