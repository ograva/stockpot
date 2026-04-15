# HWBR-002 — Weighing Scale Input Integration

| Field | Value |
| :--- | :--- |
| **Module** | HWBR — Local Hardware Bridge |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | local-bridge + user-app |
| **Depends On** | HWBR-001 (bridge server must be scaffolded), HWBR-004 (bridge URL must be configured) |

## User Statement
As a kitchen staff member, I want the receiving dialog to automatically capture the weight from a connected scale so that I don't have to type numbers while physically handling goods.

## Acceptance Criteria
1. Bridge server polls a connected serial-port scale at a configurable interval (default 500ms) and exposes `GET /scale/reading` returning `{ value: number, unit: string, timestamp: string }`.
2. If no scale is connected or the read times out, `GET /scale/reading` returns `{ value: null, error: "SCALE_NOT_CONNECTED" }` with HTTP 200 (not a 500 error).
3. In the user-app receiving dialog (KTCH-002), a "Read Scale" button appears only when the bridge is reachable (HWBR-004 connectivity check passes).
4. Tapping "Read Scale" calls `GET /scale/reading` on the bridge and populates the quantity field with the returned value.
5. If the scale read returns an error, a toast notification shows "Scale unavailable — please enter manually" without blocking the manual entry flow.
6. Serial port configuration (port name, baud rate, scale protocol) is configurable via environment variable on the bridge server.

## data-test-id List
- `hwbr-read-scale-button` — read scale button in receiving dialog (shown only when bridge is connected)
- `hwbr-scale-unavailable-toast` — toast when scale read fails
