# VNDR-003 — Update Product Pricing

| Field | Value |
| :--- | :--- |
| **Module** | VNDR — Vendor / Supplier Portal |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | vendor-app |
| **Depends On** | VNDR-002 (catalog items must exist) |

## User Statement
As a supplier representative, I want to update the price of any product in my catalog so that all linked restaurants immediately see my current pricing on their next purchase order — without me calling each one.

## Acceptance Criteria
1. Price field is inline-editable directly in the catalog list view — no modal or separate page required for a single-price edit.
2. Saving a price change timestamps the update and moves the previous price to a `priceHistory` subcollection at `vendors/{vendorId}/catalog/{ingredientId}/priceHistory/{timestamp}`.
3. Updated price is reflected in any linked restaurant's shortfall dashboard (REPO-001) and Auto-PO calculations (REPO-002) within 60 seconds of saving.
4. Bulk price update via CSV import is supported; minimum required CSV columns: `ingredientId` and `newPrice`. A preview of changes is shown before the import is confirmed.
5. Supplier sees the date of their last price update per item in the catalog list view.

## data-test-id List
- `vndr-price-edit-field-{ingredientId}` — inline price edit input
- `vndr-price-save-{ingredientId}` — save inline price change
- `vndr-price-last-updated-{ingredientId}` — last updated date display
- `vndr-bulk-price-import-button` — bulk CSV import button
- `vndr-bulk-price-preview` — import preview table
- `vndr-bulk-price-confirm-button` — confirm bulk import button
