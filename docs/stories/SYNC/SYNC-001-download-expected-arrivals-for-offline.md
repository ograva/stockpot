# SYNC-001 — Download Expected Arrivals for Offline Use

| Field | Value |
| :--- | :--- |
| **Module** | SYNC — Offline Sync & Receiving |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | REPO-005 (DISPATCHED POs must exist) |

## User Statement
As a kitchen staff member, I want to download today's expected deliveries to my device before going offline so that I can receive goods in the delivery bay without needing an internet connection.

## Acceptance Criteria
1. "Prepare for Offline" button with `data-test-id="sync-prepare-offline-button"` is prominently displayed on the Kitchen Home screen.
2. Tapping the button triggers `StoreForwardService` to fetch all `DISPATCHED` POs for today and persist them to local device storage (IndexedDB or equivalent).
3. Download includes for each PO: PO ID, supplier name, all line items (ingredient name, expected quantity, UoM), and PO status.
4. A confirmation message shows the number of items downloaded and the time of download.
5. If the device is already offline when the button is tapped, it shows a clear error: "Cannot prepare — no internet connection. Please prepare before going offline."

## data-test-id List
- `sync-prepare-offline-button` — prepare for offline action button
- `sync-prepare-success-message` — success confirmation with item count
- `sync-prepare-already-offline-error` — error when already offline on tap
- `sync-prepare-item-count` — number of items downloaded
- `sync-prepare-timestamp` — timestamp of last download
