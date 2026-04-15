/**
 * SubComponentDoc — Firestore document shape for `restaurants/{restaurantId}/subComponents/{componentId}`.
 *
 * A SubComponent is an intermediate (sub-recipe) made from raw materials that is then
 * used as an ingredient in one or more Recipes. Examples: sauces, stocks, dough batches,
 * marinated proteins, or any prep that has a calculated cost and yield.
 *
 * Cost calculation:
 *  - `calculatedCostPerUnit` = sum(ingredient.qty × rawMaterial.unitCost) / yieldQty
 *  - This value is stored and refreshed whenever ingredient costs or quantities change.
 *  - The CostService (Phase 8) owns this calculation.
 *
 * Yield:
 *  - `yieldQty` + `yieldUnit` describe the output of one production batch.
 *  - `yieldPercent` is the waste factor (e.g. 0.80 = 80% usable output from raw input).
 *    Used to adjust cost accounting for trim loss when `yieldPercent < 1`.
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `SubComponent` is the UI-facing type (no `_schemaVersion`).
 *  - `ingredients` is the ordered list of raw materials and their quantities.
 */

export const SUB_COMPONENT_SCHEMA_VERSION = 1;

/** A single ingredient line within a SubComponent. */
export interface SubComponentIngredient {
  /** Firestore document ID of the `RawMaterial`. */
  rawMaterialId: string;
  /** Quantity of the raw material used, in the raw material's `unit`. */
  qty: number;
}

/** Firestore document shape. */
export interface SubComponentDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Display name (e.g. "Tomato Base Sauce", "Brioche Dough"). */
  name: string;
  /** Ordered list of raw material ingredients and their quantities. */
  ingredients: SubComponentIngredient[];
  /** Output quantity produced by one full batch. */
  yieldQty: number;
  /** Unit of the yield output (e.g. "L", "kg", "pcs"). */
  yieldUnit: string;
  /**
   * Yield percentage as a decimal (0–1).
   * Accounts for trim loss, evaporation, or cooking shrinkage.
   * Default is 1.0 (100% — no waste).
   */
  yieldPercent: number;
  /**
   * Pre-calculated cost per `yieldUnit`.
   * Computed by CostService and cached here to avoid recalculation on every read.
   * Must be refreshed when ingredient costs or quantities change.
   */
  calculatedCostPerUnit: number;
  /** Optional description or preparation notes. */
  notes?: string;
}

/**
 * UI-facing type — `_schemaVersion` stripped.
 * Components and signals use this type exclusively.
 */
export type SubComponent = Omit<SubComponentDoc, '_schemaVersion'>;

/** Canonical defaults. */
export const SUB_COMPONENT_DEFAULTS: SubComponent = {
  name: '',
  ingredients: [],
  yieldQty: 1,
  yieldUnit: 'kg',
  yieldPercent: 1.0,
  calculatedCostPerUnit: 0,
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `SubComponent`.
 */
export function deserializeSubComponent(raw: unknown): SubComponent {
  const data = (raw ?? {}) as Partial<SubComponentDoc>;
  const version = data._schemaVersion ?? 0;

  // --- Migration gate (expand as schema evolves) ---
  if (version < SUB_COMPONENT_SCHEMA_VERSION) {
    // v0 → v1: no structural changes needed yet.
  }

  return {
    name: data.name ?? SUB_COMPONENT_DEFAULTS.name,
    ingredients: data.ingredients ?? SUB_COMPONENT_DEFAULTS.ingredients,
    yieldQty: data.yieldQty ?? SUB_COMPONENT_DEFAULTS.yieldQty,
    yieldUnit: data.yieldUnit ?? SUB_COMPONENT_DEFAULTS.yieldUnit,
    yieldPercent: data.yieldPercent ?? SUB_COMPONENT_DEFAULTS.yieldPercent,
    calculatedCostPerUnit:
      data.calculatedCostPerUnit ??
      SUB_COMPONENT_DEFAULTS.calculatedCostPerUnit,
    ...(data.notes ? { notes: data.notes } : {}),
  };
}

/**
 * Produce a null-free Firestore-safe `SubComponentDoc` from the UI-facing `SubComponent`.
 */
export function serializeSubComponent(
  component: SubComponent,
): SubComponentDoc {
  return {
    _schemaVersion: SUB_COMPONENT_SCHEMA_VERSION,
    name: component.name,
    ingredients: component.ingredients,
    yieldQty: component.yieldQty,
    yieldUnit: component.yieldUnit,
    yieldPercent: component.yieldPercent,
    calculatedCostPerUnit: component.calculatedCostPerUnit,
    ...(component.notes ? { notes: component.notes } : {}),
  };
}
