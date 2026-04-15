# ALRT-004 — PWA Push Notification Opt-In

| Field | Value |
| :--- | :--- |
| **Module** | ALRT — Alert Engine |
| **Sprint** | 3 |
| **Priority** | Med |
| **App** | user-app + Cloud Functions |
| **Depends On** | ALRT-003 (in-app notifications must be working; same alert events trigger push) |

## User Statement
As a restaurant owner, I want to opt in to push notifications so that I receive stockout and budget alerts on my phone even when the app is not open.

## Acceptance Criteria
1. Push opt-in prompt is shown to the owner after their first login, using the browser Push API permission request (`Notification.requestPermission()`).
2. If the owner grants permission, the Firebase Cloud Messaging (FCM) token is stored at `users/{userId}/fcmTokens/{tokenId}`.
3. Push notifications are sent from a Cloud Function triggered by the same alert events that write to ALRT-003's notification collection — no separate alert trigger logic.
4. Owner can revoke push permission from `/settings/notifications` using a "Turn off push notifications" toggle; revoking removes the FCM token from Firestore.
5. Opt-in prompt is only shown once; if dismissed (not denied), it is shown again after 7 days. If permission is denied by the browser, no further prompts are shown.

## data-test-id List
- `alrt-push-opt-in-prompt` — initial push notification opt-in dialog
- `alrt-push-opt-in-allow-button` — allow push notifications button
- `alrt-push-opt-in-dismiss-button` — dismiss (ask later) button
- `alrt-push-settings-toggle` — push notification toggle in /settings/notifications
- `alrt-push-opt-out-button` — explicit opt-out/revoke button
