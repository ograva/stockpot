# ALRT-003 — In-App Notification Delivery

| Field | Value |
| :--- | :--- |
| **Module** | ALRT — Alert Engine |
| **Sprint** | 3 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | ALRT-001 and ALRT-002 (alert sources must exist) |

## User Statement
As a restaurant owner or manager, I want to see alert notifications inside the app via a notifications panel so that I don't miss critical stockout or budget events during my shift.

## Acceptance Criteria
1. A bell icon in the app header shows an unread notification count badge; visible on all user-app routes.
2. Tapping the bell opens a notifications panel (slide-in drawer) listing all notifications in reverse chronological order.
3. Each notification shows: type icon, message text, timestamp, and read/unread state. Unread notifications are visually distinct (bold text or colored dot).
4. Notifications are stored at `restaurants/{restaurantId}/notifications/{notificationId}` with: `type`, `message`, `timestamp`, `isRead`, `targetRoute` (optional deep link).
5. Tapping a notification marks it as `isRead: true` in Firestore and, if `targetRoute` is set, navigates to that route.
6. "Mark all as read" bulk action available at the top of the panel.

## data-test-id List
- `alrt-notification-bell` — bell icon in header
- `alrt-notification-count-badge` — unread count badge
- `alrt-notification-panel` — slide-in notifications panel
- `alrt-notification-item-{notificationId}` — per-notification item
- `alrt-notification-unread-dot-{notificationId}` — unread indicator dot
- `alrt-mark-all-read-button` — mark all as read action
