/**
 * AppUserDoc — Firestore document shape for `restaurants/{restaurantId}/users/{uid}`.
 *
 * Represents a subscriber-side user linked to a specific restaurant tenant.
 * This is distinct from the platform-level `/users/{uid}` doc used by the admin app.
 *
 * Roles:
 *  - `owner`       — Full read/write access to all restaurant data and settings.
 *  - `manager`     — Kitchen Manager / Head Chef; manages POs and receiving but cannot access master data configuration.
 *  - `staff`       — Read-only access to recipes and prep tasks; cannot manage inventory or POs.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `AppUser` is the UI-facing type (no `_schemaVersion`).
 *  - Optional fields (`photoURL`) are omitted from Firestore when absent.
 */

export const APP_USER_SCHEMA_VERSION = 1;

export type AppUserRole = 'owner' | 'manager' | 'staff';

/** Firestore document shape. */
export interface AppUserDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Firebase Auth UID — mirrors the document ID. */
  uid: string;
  /** The restaurant this user belongs to. */
  restaurantId: string;
  /** Display name — mirrors Firebase Auth `user.displayName`. */
  name: string;
  /** Primary email — mirrors Firebase Auth `user.email`. */
  email: string;
  /** Role controls feature gating and Firestore security rules. */
  role: AppUserRole;
  /** Avatar URL — optional; omitted from Firestore when not set. */
  photoURL?: string;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type AppUser = Omit<AppUserDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const APP_USER_DEFAULTS: AppUser = {
  uid: '',
  restaurantId: '',
  name: '',
  email: '',
  role: 'staff',
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `AppUser`.
 * `_schemaVersion` is consumed for migration and then stripped.
 */
export function deserializeAppUser(raw: unknown): AppUser {
  const data = (raw ?? {}) as Partial<AppUserDoc>;
  const version = data._schemaVersion ?? 0;

  // --- Migration gate (expand as schema evolves) ---
  if (version < APP_USER_SCHEMA_VERSION) {
    // v0 → v1: no structural changes needed yet.
  }

  return {
    uid: data.uid ?? APP_USER_DEFAULTS.uid,
    restaurantId: data.restaurantId ?? APP_USER_DEFAULTS.restaurantId,
    name: data.name ?? APP_USER_DEFAULTS.name,
    email: data.email ?? APP_USER_DEFAULTS.email,
    role: data.role ?? APP_USER_DEFAULTS.role,
    // Optional — only include when the value is a non-empty string.
    ...(data.photoURL ? { photoURL: data.photoURL } : {}),
  };
}

/**
 * Produce a null-free Firestore-safe `AppUserDoc` from the UI-facing `AppUser`.
 * Adds `_schemaVersion`. Optional fields are omitted when absent.
 */
export function serializeAppUser(user: AppUser): AppUserDoc {
  return {
    _schemaVersion: APP_USER_SCHEMA_VERSION,
    uid: user.uid,
    restaurantId: user.restaurantId,
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.photoURL ? { photoURL: user.photoURL } : {}),
  };
}
