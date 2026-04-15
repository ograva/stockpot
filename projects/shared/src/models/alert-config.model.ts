/**
 * AlertConfigDoc — Firestore document shape for `restaurants/{restaurantId}/alertConfig/{materialId}`.
 *
 * Stores the alert threshold configuration for a specific raw material. The document ID
 * matches the raw material's Firestore document ID for fast O(1) lookup.
 *
 * The ALRT module Cloud Function (`checkStockAlerts`) is triggered on `RawMaterialDoc` writes.
 * It reads the corresponding `AlertConfigDoc` to determine whether an FCM push notification
 * should be sent to the restaurant owner.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `AlertConfig` is the UI-facing type (no `_schemaVersion`).
 *  - Only restaurant owners (role: 'owner') may write to this collection.
 *  - If no AlertConfigDoc exists for a material, no alert fires for that material.
 */

export const ALERT_CONFIG_SCHEMA_VERSION = 1;

/** The channel(s) through which alerts are delivered. */
export type AlertChannel = 'push' | 'email' | 'both';

/** Firestore document shape for `restaurants/{restaurantId}/alertConfig/{materialId}`. */
export interface AlertConfigDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Firestore document ID of the associated RawMaterialDoc. Mirrors the document ID. */
  rawMaterialId: string;
  /** Snapshot of the material name at config creation time (for display in admin). */
  rawMaterialName: string;
  /**
   * Stock level at or below which the alert fires.
   * Should be less than or equal to RawMaterialDoc.criticalThreshold.
   * The Cloud Function compares `currentStock <= alertThreshold` to raise the alert.
   */
  alertThreshold: number;
  /** Whether this alert is currently active. Owners can mute specific alerts. */
  isEnabled: boolean;
  /** Delivery channels for this alert. */
  channel: AlertChannel;
  /** ISO 8601 timestamp of the last time this alert fired. Optional. */
  lastFiredAt?: string;
  /** ISO 8601 timestamp when this config was created or last modified. */
  updatedAt: string;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type AlertConfig = Omit<AlertConfigDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const ALERT_CONFIG_DEFAULTS: AlertConfig = {
  rawMaterialId: '',
  rawMaterialName: '',
  alertThreshold: 0,
  isEnabled: true,
  channel: 'push',
  updatedAt: '',
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `AlertConfig`.
 */
export function deserializeAlertConfig(raw: unknown): AlertConfig {
  const data = (raw ?? {}) as Partial<AlertConfigDoc>;

  // --- Migration gate (expand as schema evolves) ---

  return {
    rawMaterialId: data.rawMaterialId ?? ALERT_CONFIG_DEFAULTS.rawMaterialId,
    rawMaterialName:
      data.rawMaterialName ?? ALERT_CONFIG_DEFAULTS.rawMaterialName,
    alertThreshold: data.alertThreshold ?? ALERT_CONFIG_DEFAULTS.alertThreshold,
    isEnabled: data.isEnabled ?? ALERT_CONFIG_DEFAULTS.isEnabled,
    channel: data.channel ?? ALERT_CONFIG_DEFAULTS.channel,
    updatedAt: data.updatedAt ?? ALERT_CONFIG_DEFAULTS.updatedAt,
    ...(data.lastFiredAt ? { lastFiredAt: data.lastFiredAt } : {}),
  };
}

/**
 * Produce a null-free Firestore-safe `AlertConfigDoc` from the UI-facing `AlertConfig`.
 */
export function serializeAlertConfig(config: AlertConfig): AlertConfigDoc {
  return {
    _schemaVersion: ALERT_CONFIG_SCHEMA_VERSION,
    rawMaterialId: config.rawMaterialId,
    rawMaterialName: config.rawMaterialName,
    alertThreshold: config.alertThreshold,
    isEnabled: config.isEnabled,
    channel: config.channel,
    updatedAt: config.updatedAt,
    ...(config.lastFiredAt ? { lastFiredAt: config.lastFiredAt } : {}),
  };
}
