# REPO-005 — PO History & Status Tracking

| Field | Value |
| :--- | :--- |
| **Module** | REPO — Smart PO & Replenishment Engine |
| **Sprint** | 2 |
| **Priority** | Med |
| **App** | user-app |

## User Statement
As a kitchen manager, I want to see the full history of all purchase orders and their current status so that I can track which deliveries are pending and which have been received.

## Acceptance Criteria
1. PO History list at `/replenishment/history` shows all POs filterable by status: `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `DISPATCHED`, `RECEIVED`, `REJECTED`.
2. Each row shows: PO number, supplier name, total cost, status badge, submitted date, and last updated date.
3. Tapping a row opens the full PO detail view with: all line items, status history timeline (status changes with timestamps and actor), and any rejection notes.
4. Manager can mark an `APPROVED` PO as `DISPATCHED` (sent to supplier); only `DISPATCHED` POs appear in the Kitchen receiving task list (KTCH-002).
5. Search and date-range filter available on the history list.

## data-test-id List
- `repo-po-list-table` — PO history table
- `repo-po-status-filter` — status filter tabs
- `repo-po-row-{poId}` — per-PO row
- `repo-po-status-badge-{status}` — status badge
- `repo-po-mark-dispatched-button-{poId}` — mark as dispatched button
- `repo-po-detail-timeline` — status history timeline on detail view
- `repo-po-search-input` — search input
- `repo-po-date-range-filter` — date range filter
