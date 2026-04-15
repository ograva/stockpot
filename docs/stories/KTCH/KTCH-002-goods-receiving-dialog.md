# KTCH-002 — Goods Receiving Dialog

| Field | Value |
| :--- | :--- |
| **Module** | KTCH — Kitchen Execution Hub |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | REPO-005 (PO must be in DISPATCHED status), SYNC-002 (must work offline) |
| **Design Rule** | One item per screen. No tables. Minimum 44px tap targets. Zero required keyboard entry. |

## User Statement
As a kitchen staff member, I want to tap through a step-by-step receiving checklist for each item on an approved delivery so that I can confirm quantities and close the receipt quickly — even offline.

## Acceptance Criteria
1. Receiving workflow presents one PO line item at a time in a full-screen dialog (step wizard, not a list).
2. Each step shows: ingredient name (large text, minimum 24px), expected quantity, and a +/– tap control for entering the actual received quantity.
3. If the hardware bridge is connected and a scale is available, a "Read Scale" button appears and auto-populates the quantity field on tap.
4. Keyboard input via a numeric input is available as a fallback but is not the primary interaction.
5. Tapping "Confirm Item" advances to the next item. Tapping "Short / Missing" flags the item with a shortage note.
6. After all items are confirmed, a summary screen lists any shortages before the "Complete Receiving" final action.
7. Completing receiving updates `currentStock` in Firestore (or queues via `StoreForwardService` if offline) and transitions the PO to `RECEIVED`.

## data-test-id List
- `ktch-receiving-dialog` — full-screen receiving dialog container
- `ktch-receiving-item-name` — ingredient name display (large text)
- `ktch-receiving-expected-qty` — expected quantity display
- `ktch-receiving-qty-decrease` — quantity decrease (–) button
- `ktch-receiving-qty-increase` — quantity increase (+) button
- `ktch-receiving-qty-value` — current quantity value display
- `ktch-receiving-read-scale-button` — read scale from hardware bridge
- `ktch-receiving-confirm-button` — confirm item and advance
- `ktch-receiving-short-button` — flag as short/missing
- `ktch-receiving-summary-screen` — post-confirmation summary
- `ktch-receiving-complete-button` — complete receiving final action
