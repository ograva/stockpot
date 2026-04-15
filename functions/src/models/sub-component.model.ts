/**
 * SubComponent — Firestore document shape for `restaurants/{restaurantId}/subComponents/{componentId}`.
 * Interface only. See projects/shared/src/models/sub-component.model.ts for
 * client-side serialize/deserialize helpers.
 */

export const SUB_COMPONENT_SCHEMA_VERSION = 1;

export interface SubComponentIngredient {
  rawMaterialId: string;
  qty: number;
}

export interface SubComponentDoc {
  _schemaVersion: number;
  name: string;
  ingredients: SubComponentIngredient[];
  yieldQty: number;
  /** Unit of the yield output (e.g. 'L', 'kg', 'pcs'). */
  yieldUnit: string;
  /** Yield as a decimal 0–1. Accounts for trim loss or cooking shrinkage. */
  yieldPercent: number;
  /** Cached cost per yieldUnit. Recomputed by CostService when inputs change. */
  calculatedCostPerUnit: number;
  notes?: string;
}
