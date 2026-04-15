/**
 * VendorCatalogItemDoc — Firestore document shape for `vendors/{vendorId}/catalog/{itemId}`.
 *
 * Represents a specific product that a platform vendor supplies, including its pricing and
 * unit of measure. Used in the VNDR module for price propagation (VNDR-003) and Auto-PO
 * price sourcing (REPO-002).
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `VendorCatalogItem` is the UI-facing type (no `_schemaVersion`).
 *  - Only the linked vendor rep (custom claim: `vendorId`) or a platform admin may write.
 *  - Price history is tracked externally in `priceHistory/` subcollection — not inline.
 */

export const VENDOR_CATALOG_ITEM_SCHEMA_VERSION = 1;

/** Firestore document shape for `vendors/{vendorId}/catalog/{itemId}`. */
export interface VendorCatalogItemDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Display name of the product (e.g. "Premium All-Purpose Flour 25kg bag"). */
  name: string;
  /** Unit of measure for this catalogue item (e.g. "bag", "kg", "L"). */
  unit: string;
  /** Current price per `unit` in PHP. Triggers VNDR-003 propagation on write. */
  pricePerUnit: number;
  /** Optional SKU or product code from the vendor's own catalogue. */
  sku?: string;
  /** ID of the linked PlatformIngredientDoc in `platform_ingredients/`. Optional. */
  platformIngredientRef?: string;
  /** Whether this item is currently available for order. */
  isAvailable: boolean;
  /** ISO 8601 timestamp of last price update. */
  priceUpdatedAt: string;
  /** ISO 8601 timestamp of when this item was added to the catalogue. */
  createdAt: string;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type VendorCatalogItem = Omit<VendorCatalogItemDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const VENDOR_CATALOG_ITEM_DEFAULTS: VendorCatalogItem = {
  name: '',
  unit: 'kg',
  pricePerUnit: 0,
  isAvailable: true,
  priceUpdatedAt: '',
  createdAt: '',
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `VendorCatalogItem`.
 */
export function deserializeVendorCatalogItem(raw: unknown): VendorCatalogItem {
  const data = (raw ?? {}) as Partial<VendorCatalogItemDoc>;

  // --- Migration gate (expand as schema evolves) ---

  return {
    name: data.name ?? VENDOR_CATALOG_ITEM_DEFAULTS.name,
    unit: data.unit ?? VENDOR_CATALOG_ITEM_DEFAULTS.unit,
    pricePerUnit:
      data.pricePerUnit ?? VENDOR_CATALOG_ITEM_DEFAULTS.pricePerUnit,
    isAvailable: data.isAvailable ?? VENDOR_CATALOG_ITEM_DEFAULTS.isAvailable,
    priceUpdatedAt:
      data.priceUpdatedAt ?? VENDOR_CATALOG_ITEM_DEFAULTS.priceUpdatedAt,
    createdAt: data.createdAt ?? VENDOR_CATALOG_ITEM_DEFAULTS.createdAt,
    ...(data.sku ? { sku: data.sku } : {}),
    ...(data.platformIngredientRef
      ? { platformIngredientRef: data.platformIngredientRef }
      : {}),
  };
}

/**
 * Produce a null-free Firestore-safe `VendorCatalogItemDoc` from the UI-facing `VendorCatalogItem`.
 */
export function serializeVendorCatalogItem(
  item: VendorCatalogItem,
): VendorCatalogItemDoc {
  return {
    _schemaVersion: VENDOR_CATALOG_ITEM_SCHEMA_VERSION,
    name: item.name,
    unit: item.unit,
    pricePerUnit: item.pricePerUnit,
    isAvailable: item.isAvailable,
    priceUpdatedAt: item.priceUpdatedAt,
    createdAt: item.createdAt,
    ...(item.sku ? { sku: item.sku } : {}),
    ...(item.platformIngredientRef
      ? { platformIngredientRef: item.platformIngredientRef }
      : {}),
  };
}
