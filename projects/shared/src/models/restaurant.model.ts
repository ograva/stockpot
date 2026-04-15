/**
 * RestaurantDoc — Firestore document shape for `restaurants/{restaurantId}`.
 *
 * Each restaurant is a tenant in StockPot. All operational sub-collections
 * (recipes, rawMaterials, inventory, etc.) are nested under this document.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `Restaurant` is the UI-facing type (no `_schemaVersion`).
 *  - `planTier` controls feature availability; enforced server-side via subscription.
 *  - `currency` defaults to PHP (Philippines market).
 *  - `timezone` defaults to Asia/Manila.
 */

export const RESTAURANT_SCHEMA_VERSION = 1;

export type PlanTier = 'starter' | 'growth' | 'enterprise';

/** Firestore document shape — includes infrastructure versioning field. */
export interface RestaurantDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Display name of the restaurant. */
  name: string;
  /** Physical address. */
  address: string;
  /** Subscription plan tier; controls feature gates. */
  planTier: PlanTier;
  /** IANA timezone identifier. */
  timezone: string;
  /** ISO 4217 currency code for cost accounting (e.g. 'PHP'). */
  currency: string;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components, forms, and signals use this type exclusively.
 */
export type Restaurant = Omit<RestaurantDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const RESTAURANT_DEFAULTS: Restaurant = {
  name: '',
  address: '',
  planTier: 'starter',
  timezone: 'Asia/Manila',
  currency: 'PHP',
  createdAt: '',
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `Restaurant`.
 * `_schemaVersion` is consumed for migration and then stripped.
 */
export function deserializeRestaurant(raw: unknown): Restaurant {
  const data = (raw ?? {}) as Partial<RestaurantDoc>;
  const version = data._schemaVersion ?? 0;

  // --- Migration gate (expand as schema evolves) ---
  if (version < RESTAURANT_SCHEMA_VERSION) {
    // v0 → v1: no structural changes needed yet.
  }

  return {
    name: data.name ?? RESTAURANT_DEFAULTS.name,
    address: data.address ?? RESTAURANT_DEFAULTS.address,
    planTier: data.planTier ?? RESTAURANT_DEFAULTS.planTier,
    timezone: data.timezone ?? RESTAURANT_DEFAULTS.timezone,
    currency: data.currency ?? RESTAURANT_DEFAULTS.currency,
    createdAt: data.createdAt ?? RESTAURANT_DEFAULTS.createdAt,
  };
}

/**
 * Produce a null-free Firestore-safe `RestaurantDoc` from the UI-facing `Restaurant`.
 * Adds `_schemaVersion`. All fields are required strings — no nulls possible.
 */
export function serializeRestaurant(restaurant: Restaurant): RestaurantDoc {
  return {
    _schemaVersion: RESTAURANT_SCHEMA_VERSION,
    name: restaurant.name,
    address: restaurant.address,
    planTier: restaurant.planTier,
    timezone: restaurant.timezone,
    currency: restaurant.currency,
    createdAt: restaurant.createdAt,
  };
}
