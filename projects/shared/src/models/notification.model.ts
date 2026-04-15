/**
 * NotificationDoc — Firestore document shape for `restaurants/{restaurantId}/notifications/{notifId}`.
 *
 * Represents a persisted notification record. When the `checkStockAlerts` Cloud Function fires
 * an FCM push notification, it also writes a NotificationDoc to this collection so that
 * the notification history is visible in-app (ALRT-004) even if the push was not delivered
 * (e.g. device was offline).
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `Notification` is the UI-facing type (no `_schemaVersion`).
 *  - Only Cloud Functions write to this collection. Restaurant users may only read.
 *  - `readAt` is written by the User-App when the notification is opened.
 */

export const NOTIFICATION_SCHEMA_VERSION = 1;

/** The category of notification — determines icon and routing behaviour in the app. */
export type NotificationType =
  | 'STOCKOUT_ALERT'
  | 'PO_APPROVED'
  | 'PO_RECEIVED'
  | 'SYSTEM';

/** Firestore document shape for `restaurants/{restaurantId}/notifications/{notifId}`. */
export interface NotificationDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Category of notification. Drives icon and deep-link routing. */
  type: NotificationType;
  /** Short title displayed in the notification banner and list. */
  title: string;
  /** Full descriptive message body. */
  body: string;
  /**
   * Deep-link path within the User-App to navigate to on tap.
   * E.g. '/inventory/raw-materials/abc123' for a STOCKOUT_ALERT.
   */
  deepLink?: string;
  /** Whether the notification has been opened/read by the user. */
  isRead: boolean;
  /** ISO 8601 timestamp when the notification was created by the Cloud Function. */
  createdAt: string;
  /** ISO 8601 timestamp when the user opened/read this notification. Optional. */
  readAt?: string;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type Notification = Omit<NotificationDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const NOTIFICATION_DEFAULTS: Notification = {
  type: 'SYSTEM',
  title: '',
  body: '',
  isRead: false,
  createdAt: '',
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `Notification`.
 */
export function deserializeNotification(raw: unknown): Notification {
  const data = (raw ?? {}) as Partial<NotificationDoc>;

  // --- Migration gate (expand as schema evolves) ---

  return {
    type: data.type ?? NOTIFICATION_DEFAULTS.type,
    title: data.title ?? NOTIFICATION_DEFAULTS.title,
    body: data.body ?? NOTIFICATION_DEFAULTS.body,
    isRead: data.isRead ?? NOTIFICATION_DEFAULTS.isRead,
    createdAt: data.createdAt ?? NOTIFICATION_DEFAULTS.createdAt,
    ...(data.deepLink ? { deepLink: data.deepLink } : {}),
    ...(data.readAt ? { readAt: data.readAt } : {}),
  };
}

/**
 * Produce a null-free Firestore-safe `NotificationDoc` from the UI-facing `Notification`.
 */
export function serializeNotification(notif: Notification): NotificationDoc {
  return {
    _schemaVersion: NOTIFICATION_SCHEMA_VERSION,
    type: notif.type,
    title: notif.title,
    body: notif.body,
    isRead: notif.isRead,
    createdAt: notif.createdAt,
    ...(notif.deepLink ? { deepLink: notif.deepLink } : {}),
    ...(notif.readAt ? { readAt: notif.readAt } : {}),
  };
}
