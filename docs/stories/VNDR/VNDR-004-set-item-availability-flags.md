# VNDR-004 — Set Item Availability Flags

| Field | Value |
| :--- | :--- |
| **Module** | VNDR — Vendor / Supplier Portal |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | vendor-app |
| **Depends On** | VNDR-002 (catalog items must exist) |

## User Statement
As a supplier representative, I want to mark a product as out of stock so that restaurants stop routing orders for that item to me and can source an alternative in time.

## Acceptance Criteria
1. Each catalog item in the list shows a toggle for `IN_STOCK` / `OUT_OF_STOCK`; toggle is tappable directly in the list view.
2. Setting an item to `OUT_OF_STOCK` is reflected in the restaurant's shortfall dashboard (REPO-001) within 60 seconds — the affected ingredient row shows an amber out-of-stock warning.
3. The Auto-PO engine (REPO-002) automatically skips out-of-stock items from the primary supplier and routes to the secondary supplier if one is configured on the restaurant's ingredient.
4. Supplier sees a summary panel on their dashboard showing: count of items currently marked out of stock, and an estimated count of restaurants that have this supplier as primary for those items.
5. Supplier can set an expected restock date when marking an item out of stock; restaurants see this date in the shortfall dashboard OOS warning.

## data-test-id List
- `vndr-availability-toggle-{ingredientId}` — in-stock/out-of-stock toggle
- `vndr-availability-oos-badge-{ingredientId}` — OOS badge on affected items
- `vndr-availability-restock-date-{ingredientId}` — expected restock date input
- `vndr-oos-summary-panel` — dashboard summary of OOS items
- `vndr-oos-affected-restaurants-count` — count of affected restaurant clients
