# KTCH-003 — Prep Batching — Log Sub-Component Production

| Field | Value |
| :--- | :--- |
| **Module** | KTCH — Kitchen Execution Hub |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | MSTR-005 (sub-components must be defined) |
| **Design Rule** | Dialog-driven. No keyboard. Large tap targets. |

## User Statement
As a kitchen staff member, I want to log a prep batch for a sub-component so that raw material stock is automatically deducted and the sub-component stock is increased to reflect what we've prepared.

## Acceptance Criteria
1. Prep batching accessible from the Kitchen Home "Prep Tasks" card at `/kitchen/prep`.
2. Staff selects a sub-component from a scrollable list and enters the batch quantity produced using a +/– tap control.
3. System deducts the correct raw material quantities based on the sub-component's ingredient chain and yield % (from MSTR-005).
4. Stock levels update immediately via optimistic UI; Firestore write happens in the background (or via `StoreForwardService` queue if offline).
5. A confirmation screen shows: sub-component name, quantity produced, and a list of raw materials consumed with their deducted amounts.
6. If sufficient raw material stock is not available to complete the batch, a warning is shown before the staff confirms (not a hard block — they can override with acknowledgment).

## data-test-id List
- `ktch-prep-subcomponent-list` — sub-component selection list
- `ktch-prep-select-{subcomponentId}` — select sub-component row
- `ktch-prep-qty-decrease` — quantity decrease button
- `ktch-prep-qty-increase` — quantity increase button
- `ktch-prep-qty-value` — batch quantity display
- `ktch-prep-insufficient-stock-warning` — insufficient raw material warning
- `ktch-prep-confirm-button` — confirm batch button
- `ktch-prep-confirmation-screen` — post-production confirmation screen
- `ktch-prep-consumed-materials-list` — list of deducted raw materials
