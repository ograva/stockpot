/**
 * AppUser — Firestore document shape for `restaurants/{restaurantId}/users/{uid}`.
 * Interface only. See projects/shared/src/models/app-user.model.ts for
 * client-side serialize/deserialize helpers.
 */

export const APP_USER_SCHEMA_VERSION = 1;

export type AppUserRole = 'owner' | 'manager' | 'staff';

export interface AppUserDoc {
  _schemaVersion: number;
  uid: string;
  restaurantId: string;
  name: string;
  email: string;
  role: AppUserRole;
  photoURL?: string;
}
