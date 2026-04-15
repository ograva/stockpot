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

export const RAW_MATERIAL_SCHEMA_VERSION = 2;

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
  /** Legacy manual threshold — kept for migration; use parMinimum for PO triggers. */
  parLevel: number;
  /**
   * Computed minimum stock threshold from MSTR-008 back-calculation engine.
   * Written by Cloud Function. When `currentStock < parMinimum`, PO is triggered.
   * Added in schema v2. Defaults to parLevel for v1 records.
   */
  parMinimum: number;
  /** Cost per `unit` in the restaurant's currency (e.g. PHP). */
  unitCost: number;
  /** Reference to the preferred supplier; references suppliers/ subcollection. Optional. */
  vendorId?: string;
  /** Category for grouping in the UI (e.g. "Dry Goods", "Proteins", "Dairy"). Optional. */
  category?: string;
  /**
   * ID of the platform ingredient this maps to (from platform_ingredients/ collection).
   * Present when the ingredient was sourced from the platform catalog (MSTR-002).
   * Absent when user-created custom ingredient (MSTR-003).
   * Added in schema v2.
   */
  platformIngredientRef?: string;
  /**
   * Stock level at or below which a stockout alert fires (ALRT-001).
   * Should be less than parMinimum (e.g. 1 day's supply buffer).
   * Added in schema v2. Omitted until configured by owner.
   */
  criticalThreshold?: number;
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
  parMinimum: 0,
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
    // v1 → v2: parMinimum added; default to parLevel value for existing records.
    //          platformIngredientRef and criticalThreshold omitted for existing records.
  }

  return {
    name: data.name ?? RAW_MATERIAL_DEFAULTS.name,
    unit: data.unit ?? RAW_MATERIAL_DEFAULTS.unit,
    currentStock: data.currentStock ?? RAW_MATERIAL_DEFAULTS.currentStock,
    parLevel: data.parLevel ?? RAW_MATERIAL_DEFAULTS.parLevel,
    parMinimum:
      data.parMinimum ?? data.parLevel ?? RAW_MATERIAL_DEFAULTS.parMinimum,
    unitCost: data.unitCost ?? RAW_MATERIAL_DEFAULTS.unitCost,
    ...(data.vendorId ? { vendorId: data.vendorId } : {}),
    ...(data.category ? { category: data.category } : {}),
    ...(data.platformIngredientRef
      ? { platformIngredientRef: data.platformIngredientRef }
      : {}),
    ...(typeof data.criticalThreshold === 'number'
      ? { criticalThreshold: data.criticalThreshold }
      : {}),
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
    parMinimum: material.parMinimum,
    unitCost: material.unitCost,
    ...(material.vendorId ? { vendorId: material.vendorId } : {}),
    ...(material.category ? { category: material.category } : {}),
    ...(material.platformIngredientRef
      ? { platformIngredientRef: material.platformIngredientRef }
      : {}),
    ...(typeof material.criticalThreshold === 'number'
      ? { criticalThreshold: material.criticalThreshold }
      : {}),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true when the material's stock has fallen to or below par level
 * and a purchase order should be generated.
 */
export function isBelowPar(material: RawMaterial): boolean {
  return material.currentStock <= material.parMinimum;
}

/**
 * Calculates the total value of on-hand stock.
 * Used in cost accounting and inventory valuation reports.
 */
export function stockValue(material: RawMaterial): number {
  return material.currentStock * material.unitCost;
}
