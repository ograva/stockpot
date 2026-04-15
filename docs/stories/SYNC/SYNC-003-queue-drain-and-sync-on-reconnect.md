# SYNC-003 — Queue Drain & Sync on Reconnect

| Field | Value |
| :--- | :--- |
| **Module** | SYNC — Offline Sync & Receiving |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | SYNC-002 (offline queue must be populated) |
| **⚠️ Open Question** | Conflict resolution strategy is UNRESOLVED. Watson must define behavior for concurrent offline + online stock changes before this story is implemented. See PRD §8, Open Question #5. |

## User Statement
As a kitchen staff member, I want my offline receiving records to automatically sync to Firebase when my internet connection is restored so that I don't have to take any manual action to save my work.

## Acceptance Criteria
1. `StoreForwardService` detects internet reconnection via `navigator.onLine` event combined with an active Firebase connectivity check (not just `navigator.onLine` alone, which can be unreliable).
2. Upon confirmed reconnection, the local queue drains in FIFO order — each queued operation is replayed against Firestore using the item's `deserialize()` transform.
3. Sync progress is shown via a status indicator displaying the remaining queue depth (e.g., "Syncing 4 of 7 operations...").
4. On full queue drain, the UI displays "All records saved" with `data-test-id="sync-complete-message"` and the SYNC status chip transitions to `ONLINE` (green).
5. If a queued write fails (e.g., a Firestore rule rejection), the failed operation is moved to an error queue and the user is notified that manual review is required — the rest of the queue continues processing.

## data-test-id List
- `sync-complete-message` — "All records saved" confirmation
- `sync-progress-indicator` — sync progress display with queue depth
- `sync-error-queue-notification` — notification for failed writes requiring manual review
