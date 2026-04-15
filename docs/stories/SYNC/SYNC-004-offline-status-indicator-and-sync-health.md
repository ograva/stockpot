# SYNC-004 — Offline Status Indicator & Sync Health

| Field | Value |
| :--- | :--- |
| **Module** | SYNC — Offline Sync & Receiving |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | user-app |

## User Statement
As a kitchen manager, I want to see the current sync status of my device at all times so that I'm never in doubt about whether my recorded data has been saved to the server.

## Acceptance Criteria
1. A persistent status chip in the app header shows one of three states: `ONLINE` (green), `OFFLINE` (amber), `SYNCING` (blue with activity indicator).
2. The chip is visible on every page within the kitchen-facing routes — it is part of the app shell layout, not page-specific.
3. Color is always accompanied by a text label (ONLINE / OFFLINE / SYNCING) to satisfy accessibility requirements for colorblind users.
4. Tapping the chip opens a sync health panel showing: current state, local queue depth, and the timestamp of the last successful sync.
5. Sync health panel also shows a "Force Sync" button that manually triggers the queue drain when the user is online.

## data-test-id List
- `sync-status-chip` — persistent header status chip
- `sync-status-label` — text label within the chip (ONLINE/OFFLINE/SYNCING)
- `sync-health-panel` — sync health panel opened on chip tap
- `sync-health-queue-depth` — queue depth display in health panel
- `sync-health-last-synced` — last successful sync timestamp
- `sync-health-force-sync-button` — manual force sync button
