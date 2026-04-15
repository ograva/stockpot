/**
 * VendorDoc — Firestore document shape for `restaurants/{restaurantId}/vendors/{vendorId}`.
 *
 * Represents a supplier from whom the restaurant purchases raw materials.
 * Vendors are referenced by `RawMaterial.vendorId` and used to group
 * purchase order line items in the PO generation engine.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `Vendor` is the UI-facing type (no `_schemaVersion`).
 *  - Optional fields (`contactPerson`, `phone`, `email`, `notes`) are omitted
 *    from Firestore when absent — Firestore does not accept null.
 *  - `leadTimeDays` is the average delivery lead time used in PO scheduling.
 */

export const VENDOR_SCHEMA_VERSION = 1;

/** Firestore document shape. */
export interface VendorDoc {
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
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type Vendor = Omit<VendorDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const VENDOR_DEFAULTS: Vendor = {
  name: '',
  leadTimeDays: 1,
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `Vendor`.
 */
export function deserializeVendor(raw: unknown): Vendor {
  const data = (raw ?? {}) as Partial<VendorDoc>;
  const version = data._schemaVersion ?? 0;

  // --- Migration gate (expand as schema evolves) ---
  if (version < VENDOR_SCHEMA_VERSION) {
    // v0 → v1: no structural changes needed yet.
  }

  return {
    name: data.name ?? VENDOR_DEFAULTS.name,
    leadTimeDays: data.leadTimeDays ?? VENDOR_DEFAULTS.leadTimeDays,
    ...(data.contactPerson ? { contactPerson: data.contactPerson } : {}),
    ...(data.phone ? { phone: data.phone } : {}),
    ...(data.email ? { email: data.email } : {}),
    ...(data.notes ? { notes: data.notes } : {}),
  };
}

/**
 * Produce a null-free Firestore-safe `VendorDoc` from the UI-facing `Vendor`.
 */
export function serializeVendor(vendor: Vendor): VendorDoc {
  return {
    _schemaVersion: VENDOR_SCHEMA_VERSION,
    name: vendor.name,
    leadTimeDays: vendor.leadTimeDays,
    ...(vendor.contactPerson ? { contactPerson: vendor.contactPerson } : {}),
    ...(vendor.phone ? { phone: vendor.phone } : {}),
    ...(vendor.email ? { email: vendor.email } : {}),
    ...(vendor.notes ? { notes: vendor.notes } : {}),
  };
}
