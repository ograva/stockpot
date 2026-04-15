/**
 * RestaurantSupplierDoc — Firestore document shape for `restaurants/{restaurantId}/suppliers/{supplierId}`.
 *
 * Represents a supplier from whom the restaurant purchases raw materials.
 * Suppliers are referenced by `RawMaterial.vendorId` and used to group
 * purchase order line items in the PO generation engine.
 *
 * Schema v2 Changes (ADL-003):
 *  - Collection path renamed from `vendors/` to `suppliers/` to avoid collision
 *    with the top-level `vendors/{vendorId}` platform vendor collection.
 *  - `isCustom: boolean` added — false when linked to a platform vendor (ADMN-007).
 *  - `platformVendorRef?: string` added — ID of the linked PlatformVendorDoc.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `RestaurantSupplier` is the UI-facing type (no `_schemaVersion`).
 *  - Optional fields omitted from Firestore when absent — Firestore does not accept null.
 *  - `leadTimeDays` is the average delivery lead time used in PO scheduling.
 *
 * @deprecated Use `RestaurantSupplierDoc` / `RestaurantSupplier` names. The legacy
 * `VendorDoc` / `Vendor` aliases are kept for migration compatibility only.
 */

export const RESTAURANT_SUPPLIER_SCHEMA_VERSION = 2;
/** @deprecated Use RESTAURANT_SUPPLIER_SCHEMA_VERSION */
export const VENDOR_SCHEMA_VERSION = RESTAURANT_SUPPLIER_SCHEMA_VERSION;

/** Firestore document shape for `restaurants/{restaurantId}/suppliers/{supplierId}`. */
export interface RestaurantSupplierDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Supplier / company name. */
  name: string;
  /** Primary contact person at the supplier. Optional. */
  contactPerson?: string;
  /** Contact phone number. Optional. */
  phone?: string;
  /** Contact email address. Optional. */
  email?: string;
  /** Average delivery lead time in calendar days. Used for PO scheduling. */
  leadTimeDays: number;
  /** Free-form notes (delivery instructions, payment terms, etc.). Optional. */
  notes?: string;
  /**
   * Whether this supplier was created by the restaurant owner (true) vs linked
   * from the platform vendor directory (false). Added in schema v2. Defaults to
   * true for all v1 records migrated from vendors/ subcollection.
   */
  isCustom: boolean;
  /**
   * ID of the linked PlatformVendorDoc in top-level `vendors/{vendorId}` collection.
   * Only present when `isCustom === false`. Added in schema v2.
   */
  platformVendorRef?: string;
}

/** @deprecated Use RestaurantSupplierDoc */
export type VendorDoc = RestaurantSupplierDoc;

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type RestaurantSupplier = Omit<RestaurantSupplierDoc, '_schemaVersion'>;

/** @deprecated Use RestaurantSupplier */
export type Vendor = RestaurantSupplier;

/** Canonical defaults. */
export const RESTAURANT_SUPPLIER_DEFAULTS: RestaurantSupplier = {
  name: '',
  leadTimeDays: 1,
  isCustom: true,
};
/** @deprecated Use RESTAURANT_SUPPLIER_DEFAULTS */
export const VENDOR_DEFAULTS = RESTAURANT_SUPPLIER_DEFAULTS;

/**
 * Normalise a raw Firestore snapshot into a fully-typed `RestaurantSupplier`.
 */
export function deserializeRestaurantSupplier(
  raw: unknown,
): RestaurantSupplier {
  const data = (raw ?? {}) as Partial<RestaurantSupplierDoc>;
  const version = data._schemaVersion ?? 0;

  // --- Migration gate ---
  if (version < RESTAURANT_SUPPLIER_SCHEMA_VERSION) {
    // v1 → v2: isCustom added; default to true for all existing supplier records.
    //          platformVendorRef omitted unless explicitly set.
  }

  return {
    name: data.name ?? RESTAURANT_SUPPLIER_DEFAULTS.name,
    leadTimeDays:
      data.leadTimeDays ?? RESTAURANT_SUPPLIER_DEFAULTS.leadTimeDays,
    isCustom: data.isCustom ?? true,
    ...(data.contactPerson ? { contactPerson: data.contactPerson } : {}),
    ...(data.phone ? { phone: data.phone } : {}),
    ...(data.email ? { email: data.email } : {}),
    ...(data.notes ? { notes: data.notes } : {}),
    ...(data.platformVendorRef
      ? { platformVendorRef: data.platformVendorRef }
      : {}),
  };
}

/** @deprecated Use deserializeRestaurantSupplier */
export const deserializeVendor = deserializeRestaurantSupplier;

/**
 * Produce a null-free Firestore-safe `RestaurantSupplierDoc` from the UI-facing `RestaurantSupplier`.
 */
export function serializeRestaurantSupplier(
  supplier: RestaurantSupplier,
): RestaurantSupplierDoc {
  return {
    _schemaVersion: RESTAURANT_SUPPLIER_SCHEMA_VERSION,
    name: supplier.name,
    leadTimeDays: supplier.leadTimeDays,
    isCustom: supplier.isCustom,
    ...(supplier.contactPerson
      ? { contactPerson: supplier.contactPerson }
      : {}),
    ...(supplier.phone ? { phone: supplier.phone } : {}),
    ...(supplier.email ? { email: supplier.email } : {}),
    ...(supplier.notes ? { notes: supplier.notes } : {}),
    ...(supplier.platformVendorRef
      ? { platformVendorRef: supplier.platformVendorRef }
      : {}),
  };
}

/** @deprecated Use serializeRestaurantSupplier */
export const serializeVendor = serializeRestaurantSupplier;
