# HWBR-004 — Bridge Connectivity Configuration

| Field | Value |
| :--- | :--- |
| **Module** | HWBR — Local Hardware Bridge |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | HWBR-001 (bridge health endpoint must exist) |
| **Note** | This story enables HWBR-002 and HWBR-003. Must be implemented first within the HWBR module. |

## User Statement
As a restaurant owner, I want to configure the local bridge server URL in the app settings so that the user-app can discover and communicate with the kitchen hardware.

## Acceptance Criteria
1. Hardware settings page at `/settings/hardware` allows the owner to enter the bridge URL (e.g., `http://192.168.1.50:3500`).
2. Upon saving, the app immediately performs a connectivity test by calling `GET /health` on the entered URL and shows a green (connected) or red (unreachable) indicator.
3. Bridge URL and last connection status are stored in `restaurants/{restaurantId}/settings/hardware` in Firestore.
4. If no bridge URL is configured, all hardware-dependent UI elements (HWBR-002 "Read Scale" button, HWBR-003 "Print Slip" button) are hidden gracefully across the entire app.
5. Bridge URL input validates that it is a valid HTTP/HTTPS URL format before allowing a save.

## data-test-id List
- `hwbr-settings-url-input` — bridge URL input
- `hwbr-settings-test-connection-button` — test connection button
- `hwbr-settings-connection-status` — connection status indicator (green/red)
- `hwbr-settings-save-button` — save settings button
- `hwbr-settings-url-validation-error` — URL format validation error
