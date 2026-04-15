/**
 * SiteSettingsDoc — Authoritative Firestore document shape for `settings/global`.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `SiteSettings` is the UI-facing type (no `_schemaVersion`).
 *    Components work exclusively with `SiteSettings`; the service handles
 *    versioning transparently via serialize/deserialize.
 *  - All fields are required with explicit defaults — no nulls ever reach Firestore.
 *  - `deserializeSiteSettings()` handles old schema documents and fills defaults.
 *  - `serializeSiteSettings()` adds `_schemaVersion` and produces a Firestore-safe payload.
 */

export const SITE_SETTINGS_SCHEMA_VERSION = 1;

/** Firestore document shape — includes infrastructure versioning field. */
export interface SiteSettingsDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  appName: string;
  theme: 'orange_theme' | 'blue_theme' | 'purple_theme';
  maintenanceMode: boolean;
  featureFlags: {
    enable_registration: boolean;
  };
}

/**
 * UI-facing settings type — `_schemaVersion` stripped.
 * This is the type that components, forms, and signals expose.
 */
export type SiteSettings = Omit<SiteSettingsDoc, '_schemaVersion'>;

/** Canonical defaults used as the signal's `initialValue` and in deserialize fallbacks. */
export const SITE_SETTINGS_DEFAULTS: SiteSettings = {
  appName: 'StockPot',
  theme: 'orange_theme',
  maintenanceMode: false,
  featureFlags: { enable_registration: true },
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `SiteSettings`.
 * `_schemaVersion` is consumed for migration and then stripped — callers
 * receive the clean UI type.
 *
 * Add migration branches inside the `version` check as schema bumps happen.
 */
export function deserializeSiteSettings(raw: unknown): SiteSettings {
  const data = (raw ?? {}) as Partial<SiteSettingsDoc>;
  const version = data._schemaVersion ?? 0;

  // --- Migration gate (expand as schema evolves) ---
  if (version < SITE_SETTINGS_SCHEMA_VERSION) {
    // v0 → v1: no structural changes needed yet; defaults below cover missing fields.
  }

  return {
    appName: data.appName ?? SITE_SETTINGS_DEFAULTS.appName,
    theme: data.theme ?? SITE_SETTINGS_DEFAULTS.theme,
    maintenanceMode:
      data.maintenanceMode ?? SITE_SETTINGS_DEFAULTS.maintenanceMode,
    featureFlags: {
      enable_registration:
        data.featureFlags?.enable_registration ??
        SITE_SETTINGS_DEFAULTS.featureFlags.enable_registration,
    },
  };
}

/**
 * Produce a Firestore-safe `SiteSettingsDoc` from the UI-facing `SiteSettings`.
 * Adds `_schemaVersion`. All fields are required booleans/strings — no nulls possible.
 */
export function serializeSiteSettings(settings: SiteSettings): SiteSettingsDoc {
  return {
    _schemaVersion: SITE_SETTINGS_SCHEMA_VERSION,
    appName: settings.appName,
    theme: settings.theme,
    maintenanceMode: settings.maintenanceMode,
    featureFlags: {
      enable_registration: settings.featureFlags.enable_registration,
    },
  };
}
