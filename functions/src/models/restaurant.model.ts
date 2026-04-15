/**
 * Restaurant — Firestore document shape for `restaurants/{restaurantId}`.
 * Interface only. See projects/shared/src/models/restaurant.model.ts for
 * client-side serialize/deserialize helpers.
 */

export const RESTAURANT_SCHEMA_VERSION = 1;

export type PlanTier = 'starter' | 'growth' | 'enterprise';

export interface RestaurantDoc {
  _schemaVersion: number;
  name: string;
  address: string;
  planTier: PlanTier;
  /** IANA timezone identifier (e.g. 'Asia/Manila'). */
  timezone: string;
  /** ISO 4217 currency code (e.g. 'PHP'). */
  currency: string;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
}
