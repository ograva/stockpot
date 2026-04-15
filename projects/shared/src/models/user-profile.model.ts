/**
 * UserProfileDoc — Authoritative Firestore document shape for `users/{uid}`.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - Optional fields (`photoURL`, `role`) are omitted from the Firestore write
 *    when they have no value — Firestore does not accept null.
 *  - `deserializeUserProfile()` normalises incoming data (old schema, missing
 *    fields, raw Firestore snapshots) to a fully-typed `UserProfileDoc`.
 *  - `serializeUserProfile()` produces a null-free payload safe for Firestore.
 */

export const USER_PROFILE_SCHEMA_VERSION = 1;

export interface UserProfileDoc {
  /** Infrastructure field — never shown in UI; drives migration logic. */
  _schemaVersion: number;
  /** Display name — mirrors Firebase Auth `user.displayName`. */
  name: string;
  /** Primary email — mirrors Firebase Auth `user.email`. */
  email: string;
  /** Avatar URL — optional; omitted from Firestore when not set. */
  photoURL?: string;
  /** Application role — defaults to 'user'. */
  role?: string;
}

/**
 * Normalise a raw Firestore snapshot (or any unknown value) into a fully-typed
 * `UserProfileDoc`. Fills every required field with a safe default so callers
 * never need to null-guard.
 *
 * Add migration branches inside the `version` switch as schema bumps happen.
 */
export function deserializeUserProfile(raw: unknown): UserProfileDoc {
  const data = (raw ?? {}) as Partial<UserProfileDoc>;
  const version = data._schemaVersion ?? 0;

  // --- Migration gate (expand as schema evolves) ---
  if (version < USER_PROFILE_SCHEMA_VERSION) {
    // v0 → v1: no structural changes needed yet; defaults below cover missing fields.
  }

  return {
    _schemaVersion: USER_PROFILE_SCHEMA_VERSION,
    name: data.name ?? '',
    email: data.email ?? '',
    role: data.role ?? 'user',
    // Optional — only include when the value is a non-empty string
    ...(data.photoURL ? { photoURL: data.photoURL } : {}),
  };
}

/**
 * Produce a null-free Firestore-safe payload from a `UserProfileDoc`.
 * `_schemaVersion` is always included. Optional fields are omitted when absent.
 */
export function serializeUserProfile(
  profile: UserProfileDoc,
): Record<string, unknown> {
  const out: Record<string, unknown> = {
    _schemaVersion: profile._schemaVersion,
    name: profile.name,
    email: profile.email,
    role: profile.role ?? 'user',
  };
  if (profile.photoURL) out['photoURL'] = profile.photoURL;
  return out;
}
