/**
 * PlatformAdminUserDoc — Firestore document shape for `adminUsers/{uid}`.
 *
 * Represents a StockPot platform admin account. The document ID is the Firebase Auth UID.
 * Platform admins manage tenants, subscriptions, and the platform ingredient/UOM catalogues.
 *
 * Authentication:
 *  - Custom claim `platform_admin: true` is set by the `assignAdminCustomClaim` Cloud Function.
 *  - First admin is bootstrapped manually via the Firebase Console.
 *  - Subsequent admins are invited by existing admins.
 *
 * Per ADL-007: all admin/restaurant users share the same Firebase Auth namespace (single project).
 * Firestore Security Rules gate all `adminUsers/` writes behind `isPlatformAdmin()`.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `PlatformAdminUser` is the UI-facing type (no `_schemaVersion`).
 *  - Only platform admins may read/write this collection.
 */

export const PLATFORM_ADMIN_USER_SCHEMA_VERSION = 1;

/** Firestore document shape for `adminUsers/{uid}`. */
export interface PlatformAdminUserDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Firebase Auth UID. Mirrors the document ID; stored inline for query convenience. */
  uid: string;
  /** Display name. */
  displayName: string;
  /** Email address linked to the Firebase Auth account. */
  email: string;
  /** Whether this admin account is active. Inactive admins cannot log into the admin app. */
  isActive: boolean;
  /** ISO 8601 timestamp of account creation. */
  createdAt: string;
  /** ISO 8601 timestamp of last login. Optional — absent until first login. */
  lastLoginAt?: string;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type PlatformAdminUser = Omit<PlatformAdminUserDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const PLATFORM_ADMIN_USER_DEFAULTS: PlatformAdminUser = {
  uid: '',
  displayName: '',
  email: '',
  isActive: true,
  createdAt: '',
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `PlatformAdminUser`.
 */
export function deserializePlatformAdminUser(raw: unknown): PlatformAdminUser {
  const data = (raw ?? {}) as Partial<PlatformAdminUserDoc>;

  // --- Migration gate (expand as schema evolves) ---

  return {
    uid: data.uid ?? PLATFORM_ADMIN_USER_DEFAULTS.uid,
    displayName: data.displayName ?? PLATFORM_ADMIN_USER_DEFAULTS.displayName,
    email: data.email ?? PLATFORM_ADMIN_USER_DEFAULTS.email,
    isActive: data.isActive ?? PLATFORM_ADMIN_USER_DEFAULTS.isActive,
    createdAt: data.createdAt ?? PLATFORM_ADMIN_USER_DEFAULTS.createdAt,
    ...(data.lastLoginAt ? { lastLoginAt: data.lastLoginAt } : {}),
  };
}

/**
 * Produce a null-free Firestore-safe `PlatformAdminUserDoc` from the UI-facing `PlatformAdminUser`.
 */
export function serializePlatformAdminUser(
  admin: PlatformAdminUser,
): PlatformAdminUserDoc {
  return {
    _schemaVersion: PLATFORM_ADMIN_USER_SCHEMA_VERSION,
    uid: admin.uid,
    displayName: admin.displayName,
    email: admin.email,
    isActive: admin.isActive,
    createdAt: admin.createdAt,
    ...(admin.lastLoginAt ? { lastLoginAt: admin.lastLoginAt } : {}),
  };
}
