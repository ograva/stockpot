# KTCH-001 — Kitchen Home — Touch-First Task List

| Field | Value |
| :--- | :--- |
| **Module** | KTCH — Kitchen Execution Hub |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | user-app |
| **Design Rule** | Minimum 44px tap targets. Dialog-driven flows. No keyboard entry. Tablet viewport (768–1280px) primary. |

## User Statement
As a kitchen staff member, I want to see my current tasks as large, clearly labeled cards when I open the app so that I can start my work immediately without navigating through menus.

## Acceptance Criteria
1. Kitchen Home at `/kitchen` renders a card-based task list showing: "Pending Receiving" (count of `DISPATCHED` POs), "Prep Tasks" (count of scheduled prep batches), and "Stock Alerts" (count of active stockout alerts).
2. Each card is a minimum 64px in height with a large icon (minimum 32px), task name, and count badge.
3. Tapping a card navigates directly to the relevant workflow — no intermediate confirmation or sub-menu.
4. Cards with a count of 0 are still visible but styled as inactive (greyed out) so the layout remains stable.
5. The layout is responsive and optimized for 768px–1280px viewport (tablet range); no horizontal scrolling.

## data-test-id List
- `ktch-home-container` — home screen container
- `ktch-home-receiving-card` — pending receiving task card
- `ktch-home-prep-card` — prep batching task card
- `ktch-home-alerts-card` — stock alerts task card
- `ktch-home-receiving-count` — count badge on receiving card
- `ktch-home-prep-count` — count badge on prep card
- `ktch-home-alerts-count` — count badge on alerts card
