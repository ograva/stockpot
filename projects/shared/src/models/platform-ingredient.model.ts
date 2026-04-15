/**
 * PlatformIngredientDoc — Firestore document shape for top-level `platform_ingredients/{ingredientId}`.
 *
 * Represents a platform-standardised ingredient. The ingredient catalogue is managed by
 * platform admins (ADMN-006) and provides a canonical list for restaurant owners to use
 * when building their raw material lists (MSTR-002) instead of typing free-form names.
 *
 * Collection path uses `platform_ingredients/` (flat) rather than `platform/catalog/ingredients/`
 * (nested) per ADL-002.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `PlatformIngredient` is the UI-facing type (no `_schemaVersion`).
 *  - Only platform admins (custom claim: `platform_admin`) may write.
 *  - Restaurants read this collection to populate ingredient search in MSTR-002.
 */

export const PLATFORM_INGREDIENT_SCHEMA_VERSION = 1;

/** Firestore document shape for `platform_ingredients/{ingredientId}`. */
export interface PlatformIngredientDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Canonical ingredient name (e.g. "All-Purpose Flour", "Soy Sauce", "Chicken Breast"). */
  name: string;
  /** Product category for filtering in the UI (e.g. "Dry Goods", "Condiments", "Proteins"). */
  category: string;
  /** Default unit of measure symbol (e.g. "kg", "L", "pcs"). Should match a PlatformUomDoc. */
  defaultUnit: string;
  /** Optional description or usage notes. */
  description?: string;
  /** Whether this ingredient is available for selection in restaurant apps. */
  isActive: boolean;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type PlatformIngredient = Omit<PlatformIngredientDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const PLATFORM_INGREDIENT_DEFAULTS: PlatformIngredient = {
  name: '',
  category: '',
  defaultUnit: 'kg',
  isActive: true,
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `PlatformIngredient`.
 */
export function deserializePlatformIngredient(
  raw: unknown,
): PlatformIngredient {
  const data = (raw ?? {}) as Partial<PlatformIngredientDoc>;

  // --- Migration gate (expand as schema evolves) ---

  return {
    name: data.name ?? PLATFORM_INGREDIENT_DEFAULTS.name,
    category: data.category ?? PLATFORM_INGREDIENT_DEFAULTS.category,
    defaultUnit: data.defaultUnit ?? PLATFORM_INGREDIENT_DEFAULTS.defaultUnit,
    isActive: data.isActive ?? PLATFORM_INGREDIENT_DEFAULTS.isActive,
    ...(data.description ? { description: data.description } : {}),
  };
}

/**
 * Produce a null-free Firestore-safe `PlatformIngredientDoc` from the UI-facing `PlatformIngredient`.
 */
export function serializePlatformIngredient(
  ingredient: PlatformIngredient,
): PlatformIngredientDoc {
  return {
    _schemaVersion: PLATFORM_INGREDIENT_SCHEMA_VERSION,
    name: ingredient.name,
    category: ingredient.category,
    defaultUnit: ingredient.defaultUnit,
    isActive: ingredient.isActive,
    ...(ingredient.description ? { description: ingredient.description } : {}),
  };
}
