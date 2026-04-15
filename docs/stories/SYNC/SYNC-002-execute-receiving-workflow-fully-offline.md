# SYNC-002 — Execute Receiving Workflow Fully Offline

| Field | Value |
| :--- | :--- |
| **Module** | SYNC — Offline Sync & Receiving |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | SYNC-001 (offline data must be cached), KTCH-002 (receiving dialog UI) |
| **⚠️ Zero Data Loss Requirement** | No data recorded during offline receiving may ever be lost, regardless of app close, device restart, or extended offline period. |

## User Statement
As a kitchen staff member, I want to complete the goods receiving workflow even when the internet is unavailable so that deliveries are never delayed or blocked by connectivity issues.

## Acceptance Criteria
1. Receiving dialog (KTCH-002) functions identically when offline, using the PO data cached in SYNC-001.
2. Each tap-to-confirm action is written to the `StoreForwardService` local queue using the ingredient's `serialize()` transform, not directly to Firestore.
3. Queued operations persist to IndexedDB (or equivalent) and survive: app close, browser tab close, and device reboot.
4. A visible offline banner with `data-test-id="sync-offline-banner"` is shown persistently throughout the offline receiving session.
5. No data is written to Firestore during offline mode — all writes are queued locally first.
6. PO `RECEIVED` status transition is also queued locally and replayed during sync (SYNC-003), not applied optimistically to Firestore while offline.

## data-test-id List
- `sync-offline-banner` — persistent offline status banner
- `sync-offline-queue-depth` — display of queued operation count
