/**
 * RecipeDoc — Firestore document shape for `restaurants/{restaurantId}/recipes/{recipeId}`.
 *
 * A Recipe is a menu item or prepared dish that references:
 *  - `RecipeRawIngredient[]` — direct raw material inputs (e.g. specific spices, garnish)
 *  - `RecipeSubComponentIngredient[]` — sub-recipe inputs (e.g. a sauce, a dough batch)
 *
 * Cost accounting:
 *  - `theoreticalCost` is the sum of all ingredient costs at the quantities defined here.
 *    Computed by CostService and cached. Refreshed when ingredient costs or quantities change.
 *  - `actualCost` is tracked from actual production records (future phase — inventory deduction).
 *    Defaults to 0 until production tracking is implemented.
 *  - `foodCostPercent` = (theoreticalCost / sellingPrice) × 100. Useful for margin analysis.
 *
 * Serving:
 *  - `portionSize` + `portionUnit` describe one serving (e.g. 250 "g", 1 "plate", 330 "mL").
 *  - `sellingPrice` is the menu price in the restaurant's currency.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `Recipe` is the UI-facing type (no `_schemaVersion`).
 */

export const RECIPE_SCHEMA_VERSION = 1;

/** A direct raw material line in a recipe (e.g. 5g of salt). */
export interface RecipeRawIngredient {
  /** Firestore document ID of the `RawMaterial`. */
  rawMaterialId: string;
  /** Quantity used per portion, in the raw material's `unit`. */
  qty: number;
}

/** A sub-component line in a recipe (e.g. 100mL of Tomato Base Sauce). */
export interface RecipeSubComponentIngredient {
  /** Firestore document ID of the `SubComponent`. */
  subComponentId: string;
  /** Quantity used per portion, in the sub-component's `yieldUnit`. */
  qty: number;
}

/** Firestore document shape. */
export interface RecipeDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Display name of the menu item (e.g. "Beef Sinigang"). */
  name: string;
  /** Menu / selling price in the restaurant's currency (e.g. PHP). */
  sellingPrice: number;
  /** Portion size as a number (e.g. 250 for a 250g serving). */
  portionSize: number;
  /** Unit of the portion (e.g. "g", "mL", "pcs", "bowl"). */
  portionUnit: string;
  /** Direct raw material ingredients for this recipe. */
  rawIngredients: RecipeRawIngredient[];
  /** Sub-component ingredients (intermediate recipes) for this recipe. */
  subComponentIngredients: RecipeSubComponentIngredient[];
  /**
   * Pre-calculated theoretical cost per portion.
   * Computed and cached by CostService. Must be refreshed on ingredient/cost changes.
   */
  theoreticalCost: number;
  /**
   * Actual cost per portion derived from production records.
   * Populated in Phase 7 (inventory deduction). Defaults to 0.
   */
  actualCost: number;
  /** Category for grouping in the menu (e.g. "Mains", "Soups", "Beverages"). Optional. */
  category?: string;
  /** Optional preparation and plating notes for kitchen staff. */
  notes?: string;
  /** Whether this recipe is currently active on the menu. */
  isActive: boolean;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type Recipe = Omit<RecipeDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const RECIPE_DEFAULTS: Recipe = {
  name: '',
  sellingPrice: 0,
  portionSize: 1,
  portionUnit: 'pcs',
  rawIngredients: [],
  subComponentIngredients: [],
  theoreticalCost: 0,
  actualCost: 0,
  isActive: true,
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `Recipe`.
 */
export function deserializeRecipe(raw: unknown): Recipe {
  const data = (raw ?? {}) as Partial<RecipeDoc>;
  const version = data._schemaVersion ?? 0;

  // --- Migration gate (expand as schema evolves) ---
  if (version < RECIPE_SCHEMA_VERSION) {
    // v0 → v1: no structural changes needed yet.
  }

  return {
    name: data.name ?? RECIPE_DEFAULTS.name,
    sellingPrice: data.sellingPrice ?? RECIPE_DEFAULTS.sellingPrice,
    portionSize: data.portionSize ?? RECIPE_DEFAULTS.portionSize,
    portionUnit: data.portionUnit ?? RECIPE_DEFAULTS.portionUnit,
    rawIngredients: data.rawIngredients ?? RECIPE_DEFAULTS.rawIngredients,
    subComponentIngredients:
      data.subComponentIngredients ?? RECIPE_DEFAULTS.subComponentIngredients,
    theoreticalCost: data.theoreticalCost ?? RECIPE_DEFAULTS.theoreticalCost,
    actualCost: data.actualCost ?? RECIPE_DEFAULTS.actualCost,
    isActive: data.isActive ?? RECIPE_DEFAULTS.isActive,
    ...(data.category ? { category: data.category } : {}),
    ...(data.notes ? { notes: data.notes } : {}),
  };
}

/**
 * Produce a null-free Firestore-safe `RecipeDoc` from the UI-facing `Recipe`.
 */
export function serializeRecipe(recipe: Recipe): RecipeDoc {
  return {
    _schemaVersion: RECIPE_SCHEMA_VERSION,
    name: recipe.name,
    sellingPrice: recipe.sellingPrice,
    portionSize: recipe.portionSize,
    portionUnit: recipe.portionUnit,
    rawIngredients: recipe.rawIngredients,
    subComponentIngredients: recipe.subComponentIngredients,
    theoreticalCost: recipe.theoreticalCost,
    actualCost: recipe.actualCost,
    isActive: recipe.isActive,
    ...(recipe.category ? { category: recipe.category } : {}),
    ...(recipe.notes ? { notes: recipe.notes } : {}),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Calculates the food cost percentage for a recipe.
 * Returns 0 if sellingPrice is 0 to avoid division by zero.
 */
export function foodCostPercent(recipe: Recipe): number {
  if (recipe.sellingPrice === 0) return 0;
  return (recipe.theoreticalCost / recipe.sellingPrice) * 100;
}

/**
 * Calculates the gross profit per portion.
 */
export function grossProfitPerPortion(recipe: Recipe): number {
  return recipe.sellingPrice - recipe.theoreticalCost;
}
