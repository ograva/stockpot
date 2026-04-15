/**
 * Recipe — Firestore document shape for `restaurants/{restaurantId}/recipes/{recipeId}`.
 * Interface only. See projects/shared/src/models/recipe.model.ts for
 * client-side serialize/deserialize helpers.
 */

export const RECIPE_SCHEMA_VERSION = 1;

export interface RecipeRawIngredient {
  rawMaterialId: string;
  /** Quantity per portion in the raw material's unit. */
  qty: number;
}

export interface RecipeSubComponentIngredient {
  subComponentId: string;
  /** Quantity per portion in the sub-component's yieldUnit. */
  qty: number;
}

export interface RecipeDoc {
  _schemaVersion: number;
  name: string;
  /** Menu / selling price in the restaurant's currency. */
  sellingPrice: number;
  portionSize: number;
  portionUnit: string;
  rawIngredients: RecipeRawIngredient[];
  subComponentIngredients: RecipeSubComponentIngredient[];
  /** Cached theoretical cost per portion. Recomputed by CostService. */
  theoreticalCost: number;
  /** Actual cost derived from production records. 0 until Phase 7 is implemented. */
  actualCost: number;
  category?: string;
  notes?: string;
  isActive: boolean;
}
