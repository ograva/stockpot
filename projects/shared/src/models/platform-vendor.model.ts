/**
 * PlatformVendorDoc — Firestore document shape for top-level `vendors/{vendorId}`.
 *
 * Represents a supplier registered on the StockPot platform by a platform admin.
 * Restaurant owners can link their local RestaurantSupplierDoc to a PlatformVendorDoc,
 * enabling auto-population of the vendor catalog and price synchronisation (VNDR module).
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `PlatformVendor` is the UI-facing type (no `_schemaVersion`).
 *  - Optional fields are omitted from Firestore when absent — Firestore does not accept null.
 *  - Only platform admins (custom claim: `platform_admin`) may write to this collection.
 */

export const PLATFORM_VENDOR_SCHEMA_VERSION = 1;

/** Firestore document shape for `vendors/{vendorId}`. */
export interface PlatformVendorDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Display name of the supplier organisation. */
  name: string;
  /** Categories of products supplied (e.g. ['Dry Goods', 'Proteins']). */
  categories: string[];
  /** Primary contact email for order inquiries. Optional. */
  email?: string;
  /** Primary contact phone number. Optional. */
  phone?: string;
  /** Website URL. Optional. */
  website?: string;
  /** Whether this vendor is visible to restaurant owners for linking. */
  isActive: boolean;
  /** ISO 8601 timestamp of when the vendor record was created. */
  createdAt: string;
  /** ISO 8601 timestamp of last modification. */
  updatedAt: string;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type PlatformVendor = Omit<PlatformVendorDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const PLATFORM_VENDOR_DEFAULTS: PlatformVendor = {
  name: '',
  categories: [],
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `PlatformVendor`.
 */
export function deserializePlatformVendor(raw: unknown): PlatformVendor {
  const data = (raw ?? {}) as Partial<PlatformVendorDoc>;

  // --- Migration gate (expand as schema evolves) ---

  return {
    name: data.name ?? PLATFORM_VENDOR_DEFAULTS.name,
    categories: data.categories ?? PLATFORM_VENDOR_DEFAULTS.categories,
    isActive: data.isActive ?? PLATFORM_VENDOR_DEFAULTS.isActive,
    createdAt: data.createdAt ?? PLATFORM_VENDOR_DEFAULTS.createdAt,
    updatedAt: data.updatedAt ?? PLATFORM_VENDOR_DEFAULTS.updatedAt,
    ...(data.email ? { email: data.email } : {}),
    ...(data.phone ? { phone: data.phone } : {}),
    ...(data.website ? { website: data.website } : {}),
  };
}

/**
 * Produce a null-free Firestore-safe `PlatformVendorDoc` from the UI-facing `PlatformVendor`.
 */
export function serializePlatformVendor(
  vendor: PlatformVendor,
): PlatformVendorDoc {
  return {
    _schemaVersion: PLATFORM_VENDOR_SCHEMA_VERSION,
    name: vendor.name,
    categories: vendor.categories,
    isActive: vendor.isActive,
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt,
    ...(vendor.email ? { email: vendor.email } : {}),
    ...(vendor.phone ? { phone: vendor.phone } : {}),
    ...(vendor.website ? { website: vendor.website } : {}),
  };
}
