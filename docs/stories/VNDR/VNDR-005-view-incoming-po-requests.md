# VNDR-005 — View Incoming PO Requests

| Field | Value |
| :--- | :--- |
| **Module** | VNDR — Vendor / Supplier Portal |
| **Sprint** | 2 |
| **Priority** | Med |
| **App** | vendor-app |
| **Depends On** | REPO-004 (POs must reach APPROVED/DISPATCHED status), MSTR-004 (restaurant must have linked this supplier) |

## User Statement
As a supplier representative, I want to see purchase orders from restaurants that include my products so that I can prepare deliveries accurately and reduce back-and-forth communication.

## Acceptance Criteria
1. PO view at `/vendor/orders` lists all `DISPATCHED` POs from restaurants that have this supplier assigned to at least one ingredient.
2. Each PO row shows: restaurant name, PO number, total item count, dispatch date, and an expected delivery date field (editable by the supplier).
3. Supplier can expand a PO to see the full line item list — ingredient names, quantities, and UoMs.
4. Supplier does not see any restaurant's pricing, budget, or financial data beyond the quantities ordered — only the ingredient name and quantity per line item are visible.
5. Supplier can mark a PO as "Acknowledged" to signal they have received and are preparing the order; this status is visible to the restaurant manager in REPO-005.

## data-test-id List
- `vndr-orders-list` — incoming PO list
- `vndr-order-row-{poId}` — per-PO row
- `vndr-order-expand-{poId}` — expand PO line items
- `vndr-order-line-items-{poId}` — line items for expanded PO
- `vndr-order-expected-delivery-{poId}` — editable expected delivery date
- `vndr-order-acknowledge-button-{poId}` — acknowledge PO button
