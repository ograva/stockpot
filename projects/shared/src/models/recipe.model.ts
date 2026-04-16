/**
 * RecipeDoc — Firestore document shape for `restaurants/{restaurantId}/recipes/{recipeId}`.
 *
 * A Recipe is a menu item or prepared dish assembled from:
 *  - `RecipeRawIngredient[]`        — direct raw material inputs (e.g. spices, garnish)
 *  - `RecipeSubComponentIngredient[]` — sub-component inputs (e.g. a sauce, a dough batch)
 *
 * Recipe types:
 *  - `PRE_MADE`        — prepared ahead of time in batches (ice cream, cookies, pastries).
 *                        Tracks finished-serving inventory via `currentStock`.
 *                        Ingredient deduction occurs when a prep batch is initiated.
 *  - `COOKED_TO_ORDER` — assembled fresh per order (pasta, burgers, soups).
 *                        `currentStock` stays 0; no serving-level inventory is tracked.
 *                        Ingredient deduction also occurs when cooking is initiated,
 *                        not at point of sale.
 *
 * Instructions:
 *  - `instructions` is an ordered array of HTML strings for rich kitchen-facing display.
 *  - Rendered with [innerHTML] in the UI. Falls back to `notes` for plain-text context.
 *
 * Cost accounting:
 *  - `theoreticalCost` — sum of all ingredient costs at defined quantities, per portion.
 *    Computed and cached by CostService.
 *  - `actualCost`      — from production records (deduction phase). Defaults to 0.
 *  - `foodCostPercent` = (theoreticalCost / sellingPrice) × 100 (helper, not stored).
 *
 * Serving:
 *  - `portionSize` + `portionUnit` describe one serving (e.g. 250 "g", 1 "bowl").
 *  - `sellingPrice` is the menu price in the restaurant's currency.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `Recipe` is the UI-facing type (no `_schemaVersion`).
 */

export const RECIPE_SCHEMA_VERSION = 3;

/**
 * Determines inventory and deduction behaviour for this recipe.
 *  - `PRE_MADE`        — batch-prepared ahead; tracks `currentStock` of finished portions.
 *  - `COOKED_TO_ORDER` — made fresh; no finished-portion inventory tracked.
 */
export type RecipeType = 'PRE_MADE' | 'COOKED_TO_ORDER';

/** A direct raw material line in a recipe (e.g. 5g of salt per portion). */
export interface RecipeRawIngredient {
  /** Firestore document ID of the `RawMaterial`. */
  rawMaterialId: string;
  /** Quantity used per portion, in the raw material's `unit`. */
  qty: number;
}

/** A sub-component line in a recipe (e.g. 100mL of Tomato Base Sauce per portion). */
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
  /**
   * Determines inventory tracking and deduction behaviour.
   * Added in schema v3. Defaults to 'COOKED_TO_ORDER' for migrated records.
   */
  recipeType: RecipeType;
  /** Menu / selling price in the restaurant's currency (e.g. PHP). */
  sellingPrice: number;
  /** Portion size as a number (e.g. 250 for a 250g serving). */
  portionSize: number;
  /** Unit of the portion (e.g. "g", "mL", "pcs", "bowl"). */
  portionUnit: string;
  /** Direct raw material ingredients for this recipe. */
  rawIngredients: RecipeRawIngredient[];
  /** Sub-component ingredients for this recipe. */
  subComponentIngredients: RecipeSubComponentIngredient[];
  /**
   * Ordered preparation steps. Each element is an HTML string.
   * Rendered via [innerHTML] to support rich formatting (bold, lists, etc.).
   * Added in schema v3. Defaults to [].
   */
  instructions: string[];
  /**
   * Pre-calculated theoretical cost per portion.
   * Computed and cached by CostService. Refreshed on ingredient/cost changes.
   */
  theoreticalCost: number;
  /**
   * Actual cost per portion derived from production records.
   * Populated during inventory deduction phase. Defaults to 0.
   */
  actualCost: number;
  /**
   * On-hand finished-portion count.
   * Meaningful only for `PRE_MADE` recipes. Decremented when a portion is served.
   * Added in schema v3. Defaults to 0.
   */
  currentStock: number;
  /** Category for grouping in the menu (e.g. "Mains", "Soups", "Beverages"). Optional. */
  category?: string;
  /** Optional free-text context, plating notes, or allergen info for kitchen staff. */
  notes?: string;
  /** Whether this recipe is currently active on the menu. */
  isActive: boolean;
  /**
   * Minimum portions target for this recipe.
   * Input to the MSTR-008 back-calculation engine which derives `parMinimum`
   * for each raw material in the ingredient chain.
   * Added in schema v2. Defaults to 0 until configured by owner.
   */
  parPortions: number;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type Recipe = Omit<RecipeDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const RECIPE_DEFAULTS: Recipe = {
  name: '',
  recipeType: 'COOKED_TO_ORDER',
  sellingPrice: 0,
  portionSize: 1,
  portionUnit: 'pcs',
  rawIngredients: [],
  subComponentIngredients: [],
  instructions: [],
  theoreticalCost: 0,
  actualCost: 0,
  currentStock: 0,
  isActive: true,
  parPortions: 0,
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `Recipe`.
 *
 * Migration gates:
 *  v1 → v2: `parPortions` added; defaults to 0.
 *  v2 → v3: `recipeType`, `instructions`, `currentStock` added with defaults.
 */
export function deserializeRecipe(raw: unknown): Recipe {
  const data = (raw ?? {}) as Partial<RecipeDoc>;

  return {
    name: data.name ?? RECIPE_DEFAULTS.name,
    recipeType: data.recipeType ?? RECIPE_DEFAULTS.recipeType,
    sellingPrice: data.sellingPrice ?? RECIPE_DEFAULTS.sellingPrice,
    portionSize: data.portionSize ?? RECIPE_DEFAULTS.portionSize,
    portionUnit: data.portionUnit ?? RECIPE_DEFAULTS.portionUnit,
    rawIngredients: data.rawIngredients ?? RECIPE_DEFAULTS.rawIngredients,
    subComponentIngredients:
      data.subComponentIngredients ?? RECIPE_DEFAULTS.subComponentIngredients,
    instructions: data.instructions ?? RECIPE_DEFAULTS.instructions,
    theoreticalCost: data.theoreticalCost ?? RECIPE_DEFAULTS.theoreticalCost,
    actualCost: data.actualCost ?? RECIPE_DEFAULTS.actualCost,
    currentStock: data.currentStock ?? RECIPE_DEFAULTS.currentStock,
    isActive: data.isActive ?? RECIPE_DEFAULTS.isActive,
    parPortions: data.parPortions ?? RECIPE_DEFAULTS.parPortions,
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
    recipeType: recipe.recipeType,
    sellingPrice: recipe.sellingPrice,
    portionSize: recipe.portionSize,
    portionUnit: recipe.portionUnit,
    rawIngredients: recipe.rawIngredients,
    subComponentIngredients: recipe.subComponentIngredients,
    instructions: recipe.instructions,
    theoreticalCost: recipe.theoreticalCost,
    actualCost: recipe.actualCost,
    currentStock: recipe.currentStock,
    isActive: recipe.isActive,
    parPortions: recipe.parPortions,
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
