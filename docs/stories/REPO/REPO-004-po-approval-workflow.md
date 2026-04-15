# REPO-004 — PO Approval Workflow

| Field | Value |
| :--- | :--- |
| **Module** | REPO — Smart PO & Replenishment Engine |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | user-app |

## User Statement
As a restaurant owner, I want to review and approve purchase orders before they are dispatched to vendors so that I maintain full budget control over purchasing.

## Acceptance Criteria
1. Submitted POs appear in the owner's approval queue at `/replenishment/approvals` with status `PENDING_APPROVAL`.
2. PO detail view shows: supplier, all line items with quantities and prices, PO total, submitting manager's name, and submission timestamp.
3. Owner can approve (status → `APPROVED`) or reject (status → `REJECTED`) with an optional rejection note.
4. An `APPROVED` PO is immutable — no line item edits are permitted after approval. Approved POs can be marked as `DISPATCHED` by the manager.
5. Rejection triggers an in-app notification to the submitting manager with the owner's rejection note included.
6. Budget check: if the PO total exceeds the configured weekly purchasing budget, a warning is shown to the owner before approval (not a hard block — owner can override with acknowledgment).

## data-test-id List
- `repo-approval-queue-list` — approval queue list
- `repo-approval-po-row-{poId}` — per-PO row
- `repo-po-approve-button` — approve button
- `repo-po-reject-button` — reject button
- `repo-po-reject-note-input` — rejection note input
- `repo-po-budget-warning` — over-budget warning before approval
- `repo-po-budget-override-checkbox` — owner acknowledgment checkbox for budget override
