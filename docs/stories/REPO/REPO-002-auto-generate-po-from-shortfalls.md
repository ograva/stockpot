# REPO-002 — Auto-Generate PO from Shortfalls

| Field | Value |
| :--- | :--- |
| **Module** | REPO — Smart PO & Replenishment Engine |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | REPO-001 (shortfall data), MSTR-004 (supplier links), MSTR-008 (par minimums) |

## User Statement
As a kitchen manager, I want to generate a recommended Purchase Order from the shortfall list in one action so that I can dispatch orders to vendors without manually calculating quantities.

## Acceptance Criteria
1. "Generate PO" button on the shortfall dashboard creates a draft PO within 3 seconds for up to 50 shortfall line items.
2. Line items are automatically grouped by supplier into separate PO documents (one PO per supplier).
3. Quantities are calculated to bring each ingredient from current stock level up to `parMinimum` plus a configurable buffer percentage (configurable per restaurant in settings; default 10%).
4. PO uses the platform Vendor Portal price if the ingredient is linked to a platform supplier; falls back to the manually entered price otherwise. The price source is labeled on each line item.
5. Generated PO is in `DRAFT` status and is fully editable before submission — manager can adjust quantities, remove lines, or change the assigned supplier per line.
6. If a shortfall ingredient has no supplier linked, it is excluded from the auto-PO and listed in a "Unassigned Items" warning beneath the generated PO.

## data-test-id List
- `repo-generate-po-button` — generate PO action button
- `repo-po-draft-container` — draft PO container
- `repo-po-line-item-{ingredientId}` — per-line-item row
- `repo-po-line-price-source-{ingredientId}` — price source label (live/manual)
- `repo-po-unassigned-warning` — unassigned items warning section
- `repo-po-submit-button` — submit for approval button
