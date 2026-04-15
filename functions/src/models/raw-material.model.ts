/**
 * RawMaterial — Firestore document shape for `restaurants/{restaurantId}/rawMaterials/{materialId}`.
 * Interface only. See projects/shared/src/models/raw-material.model.ts for
 * client-side serialize/deserialize helpers.
 */

export const RAW_MATERIAL_SCHEMA_VERSION = 1;

export interface RawMaterialDoc {
  _schemaVersion: number;
  name: string;
  /** Unit of measure (e.g. 'kg', 'g', 'L', 'mL', 'pcs', 'bag'). */
  unit: string;
  currentStock: number;
  parLevel: number;
  /** Cost per unit in the restaurant's currency. */
  unitCost: number;
  vendorId?: string;
  category?: string;
}
