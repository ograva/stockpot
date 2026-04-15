# ADMN-008 — Supplier Product Catalog Admin View

| Field | Value |
| :--- | :--- |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Sprint** | 1 |
| **Priority** | Med |
| **App** | admin |

## User Statement
As a platform operator, I want to see what each platform-managed supplier carries and at what listed price so that I can audit catalog quality and flag inaccurate entries.

## Acceptance Criteria
1. Supplier detail page at `/admin/suppliers/{vendorId}` shows a catalog tab listing all products the supplier has added.
2. Each catalog row shows: ingredient name (linked to Master Catalog entry), supplier SKU (if set), current price, price UoM, availability status, and date of last price update.
3. Admin can view `priceHistory` for any catalog item — a list of previous prices with timestamps.
4. Admin can flag a catalog item as "Under Review" if pricing appears incorrect; this flag is visible to the supplier in the Vendor Portal.
5. Admin cannot directly edit a supplier's prices (to avoid circumventing the supplier self-management model), but can add admin notes to flagged items.

## data-test-id List
- `admn-supplier-catalog-table` — catalog item table
- `admn-supplier-catalog-row-{ingredientId}` — per-row identifier
- `admn-supplier-price-history-button-{ingredientId}` — view price history
- `admn-supplier-flag-button-{ingredientId}` — flag item for review
- `admn-supplier-flag-note-input` — admin note for flagged item
