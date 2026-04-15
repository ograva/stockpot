/**
 * RawMaterialDoc — Firestore document shape for `restaurants/{restaurantId}/rawMaterials/{materialId}`.
 *
 * Represents a physical ingredient or supply item that can be:
 *  - Purchased from a vendor (via Purchase Orders)
 *  - Used directly in a Recipe
 *  - Used as an ingredient in a SubComponent
 *
 * Inventory tracking:
 *  - `currentStock` is the on-hand quantity in `unit`.
 *  - `parLevel` is the minimum stock threshold — when `currentStock < parLevel`,
 *    the PO generation engine will include this material in its next run.
 *
 * Cost accounting:
 *  - `unitCost` is the latest known cost per `unit` from the vendor.
 *  - Updated when a PO is received or manually adjusted by a manager.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `RawMaterial` is the UI-facing type (no `_schemaVersion`).
 *  - `vendorId` is optional — some materials may have no preferred vendor yet.
 */

export const RAW_MATERIAL_SCHEMA_VERSION = 1;

/** Firestore document shape. */
export interface RawMaterialDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Display name of the ingredient (e.g. "All-purpose flour"). */
  name: string;
  /** Unit of measure (e.g. "kg", "g", "L", "mL", "pcs", "bag"). */
  unit: string;
  /** Current on-hand stock quantity in `unit`. */
  currentStock: number;
  /** Minimum stock threshold before a PO is triggered. */
  parLevel: number;
  /** Cost per `unit` in the restaurant's currency (e.g. PHP). */
  unitCost: number;
  /** Reference to the preferred vendor; optional. */
  vendorId?: string;
  /** Category for grouping in the UI (e.g. "Dry Goods", "Proteins", "Dairy"). Optional. */
  category?: string;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type RawMaterial = Omit<RawMaterialDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const RAW_MATERIAL_DEFAULTS: RawMaterial = {
  name: '',
  unit: 'kg',
  currentStock: 0,
  parLevel: 0,
  unitCost: 0,
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `RawMaterial`.
 */
export function deserializeRawMaterial(raw: unknown): RawMaterial {
  const data = (raw ?? {}) as Partial<RawMaterialDoc>;
  const version = data._schemaVersion ?? 0;

  // --- Migration gate (expand as schema evolves) ---
  if (version < RAW_MATERIAL_SCHEMA_VERSION) {
    // v0 → v1: no structural changes needed yet.
  }

  return {
    name: data.name ?? RAW_MATERIAL_DEFAULTS.name,
    unit: data.unit ?? RAW_MATERIAL_DEFAULTS.unit,
    currentStock: data.currentStock ?? RAW_MATERIAL_DEFAULTS.currentStock,
    parLevel: data.parLevel ?? RAW_MATERIAL_DEFAULTS.parLevel,
    unitCost: data.unitCost ?? RAW_MATERIAL_DEFAULTS.unitCost,
    ...(data.vendorId ? { vendorId: data.vendorId } : {}),
    ...(data.category ? { category: data.category } : {}),
  };
}

/**
 * Produce a null-free Firestore-safe `RawMaterialDoc` from the UI-facing `RawMaterial`.
 */
export function serializeRawMaterial(material: RawMaterial): RawMaterialDoc {
  return {
    _schemaVersion: RAW_MATERIAL_SCHEMA_VERSION,
    name: material.name,
    unit: material.unit,
    currentStock: material.currentStock,
    parLevel: material.parLevel,
    unitCost: material.unitCost,
    ...(material.vendorId ? { vendorId: material.vendorId } : {}),
    ...(material.category ? { category: material.category } : {}),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true when the material's stock has fallen to or below par level
 * and a purchase order should be generated.
 */
export function isBelowPar(material: RawMaterial): boolean {
  return material.currentStock <= material.parLevel;
}

/**
 * Calculates the total value of on-hand stock.
 * Used in cost accounting and inventory valuation reports.
 */
export function stockValue(material: RawMaterial): number {
  return material.currentStock * material.unitCost;
}
