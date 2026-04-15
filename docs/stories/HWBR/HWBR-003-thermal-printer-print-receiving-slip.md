# HWBR-003 — Thermal Printer — Print Receiving Slip

| Field | Value |
| :--- | :--- |
| **Module** | HWBR — Local Hardware Bridge |
| **Sprint** | 2 |
| **Priority** | Med |
| **App** | local-bridge + user-app |
| **Depends On** | HWBR-001 (bridge server), HWBR-004 (bridge URL configured), KTCH-002 (receiving must be completable) |

## User Statement
As a kitchen manager, I want to print a receiving slip on the kitchen thermal printer when a PO is marked as received so that we have a physical paper record for filing and dispute resolution.

## Acceptance Criteria
1. Bridge server exposes `POST /printer/receiving-slip` accepting a JSON payload containing the completed PO receipt data.
2. Printed slip contains: date and time, supplier name, PO number, line items with ingredient names and received quantities (including any shortage flags), receiver's name, and a total item count.
3. After completing a receiving session (KTCH-002 "Complete Receiving"), a "Print Slip" button appears in the confirmation screen.
4. If the thermal printer is unreachable, the print action fails gracefully and offers "Download as PDF" as an alternative — the user is NOT stuck.
5. Printer type and connection details (USB vs. network, IP address) are configurable via environment variable on the bridge server.

## data-test-id List
- `hwbr-print-slip-button` — print slip button on receiving confirmation screen
- `hwbr-print-unavailable-message` — message when printer is unreachable
- `hwbr-download-pdf-button` — PDF download fallback button
