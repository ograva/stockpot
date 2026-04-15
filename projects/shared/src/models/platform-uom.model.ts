/**
 * PlatformUomDoc — Firestore document shape for top-level `platform_uom/{uomId}`.
 *
 * Represents a platform-standardised unit of measure. The UOM catalogue is managed by
 * platform admins (ADMN-005) and used across all restaurants for consistent measurement
 * in recipes, raw materials, and purchase orders.
 *
 * Collection path uses `platform_uom/` (flat) rather than `platform/catalog/uom/` (nested)
 * per ADL-002 to avoid Firestore collectionGroup conflicts and Security Rule complexity.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `PlatformUom` is the UI-facing type (no `_schemaVersion`).
 *  - Only platform admins (custom claim: `platform_admin`) may write.
 *  - Restaurants read this collection to populate UOM dropdowns in recipes and materials.
 */

export const PLATFORM_UOM_SCHEMA_VERSION = 1;

/** Firestore document shape for `platform_uom/{uomId}`. */
export interface PlatformUomDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Short symbol displayed in UI (e.g. "kg", "g", "L", "mL", "pcs", "bag"). */
  symbol: string;
  /** Full display name (e.g. "Kilogram", "Gram", "Litre"). */
  name: string;
  /** Measurement category for grouping in dropdowns (e.g. "Weight", "Volume", "Count"). */
  category: 'weight' | 'volume' | 'count' | 'other';
  /**
   * Conversion factor to the base unit of this category.
   * E.g. for 'g' (base = 'kg'): conversionFactor = 0.001.
   * For 'kg' (itself the base): conversionFactor = 1.
   * Used in back-calculation when recipe and raw material units differ.
   */
  conversionFactor: number;
  /** Symbol of the base unit for this category (e.g. 'kg' for weight). */
  baseUnit: string;
  /** Whether this UOM is available for selection in restaurant apps. */
  isActive: boolean;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type PlatformUom = Omit<PlatformUomDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const PLATFORM_UOM_DEFAULTS: PlatformUom = {
  symbol: '',
  name: '',
  category: 'count',
  conversionFactor: 1,
  baseUnit: 'pcs',
  isActive: true,
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `PlatformUom`.
 */
export function deserializePlatformUom(raw: unknown): PlatformUom {
  const data = (raw ?? {}) as Partial<PlatformUomDoc>;

  // --- Migration gate (expand as schema evolves) ---

  return {
    symbol: data.symbol ?? PLATFORM_UOM_DEFAULTS.symbol,
    name: data.name ?? PLATFORM_UOM_DEFAULTS.name,
    category: data.category ?? PLATFORM_UOM_DEFAULTS.category,
    conversionFactor:
      data.conversionFactor ?? PLATFORM_UOM_DEFAULTS.conversionFactor,
    baseUnit: data.baseUnit ?? PLATFORM_UOM_DEFAULTS.baseUnit,
    isActive: data.isActive ?? PLATFORM_UOM_DEFAULTS.isActive,
  };
}

/**
 * Produce a null-free Firestore-safe `PlatformUomDoc` from the UI-facing `PlatformUom`.
 */
export function serializePlatformUom(uom: PlatformUom): PlatformUomDoc {
  return {
    _schemaVersion: PLATFORM_UOM_SCHEMA_VERSION,
    symbol: uom.symbol,
    name: uom.name,
    category: uom.category,
    conversionFactor: uom.conversionFactor,
    baseUnit: uom.baseUnit,
    isActive: uom.isActive,
  };
}
