/**
 * Vendor — Firestore document shape for `restaurants/{restaurantId}/vendors/{vendorId}`.
 * Interface only. See projects/shared/src/models/vendor.model.ts for
 * client-side serialize/deserialize helpers.
 */

export const VENDOR_SCHEMA_VERSION = 1;

export interface VendorDoc {
  _schemaVersion: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  /** Average delivery lead time in calendar days. */
  leadTimeDays: number;
  notes?: string;
}
