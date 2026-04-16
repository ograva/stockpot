/**
 * SubComponentDoc — Firestore document shape for `restaurants/{restaurantId}/subComponents/{componentId}`.
 *
 * A SubComponent is an intermediate preparation (sub-recipe) assembled from raw materials
 * and/or other sub-components, then used as an ingredient in Recipes or other SubComponents.
 * Examples: sauces, stocks, dough batches, marinated proteins, spice blends.
 *
 * Ingredient chain:
 *  - `rawIngredients[]` — direct raw material inputs.
 *  - `subComponentIngredients[]` — nested sub-component inputs (unbounded depth).
 *  - Cycle detection is handled at traversal time via a visited-ID Set; it is NOT
 *    enforced at the document level. The back-calculation engine is responsible.
 *
 * Instructions:
 *  - `instructions` is an ordered array of HTML strings.
 *  - Rendered with [innerHTML] in the UI to support bold, lists, etc.
 *
 * Inventory:
 *  - `currentStock` tracks on-hand batch quantity in `yieldUnit`.
 *  - Operators who do not track sub-component stock leave this at 0.
 *
 * PAR & alerts (optional — disabled by default):
 *  - `parMinimum` — when `currentStock < parMinimum` a reorder alert fires (ALRT-001).
 *  - `criticalThreshold` — lower stockout alarm level (should be < parMinimum).
 *  - Both default to 0. When 0, no alert is evaluated. Omitted from Firestore when 0.
 *
 * Cost calculation:
 *  - `calculatedCostPerUnit` = Σ(ingredient costs) / (yieldQty × yieldPercent)
 *  - Cached by CostService; refreshed when ingredient costs or quantities change.
 *
 * Yield:
 *  - `yieldQty` + `yieldUnit` describe one production batch's output.
 *  - `yieldPercent` is the usable-output factor (e.g. 0.80 = 20% trim/evaporation loss).
 *
 * Rules:
 *  - `_schemaVersion` is always written; never stripped by serialize().
 *  - `SubComponent` is the UI-facing type (no `_schemaVersion`).
 */

export const SUB_COMPONENT_SCHEMA_VERSION = 2;

/** A raw material line within a SubComponent. */
export interface SubComponentRawIngredient {
  /** Firestore document ID of the `RawMaterial`. */
  rawMaterialId: string;
  /** Quantity of the raw material used, in the raw material's `unit`. */
  qty: number;
}

/** A nested sub-component line within a SubComponent. */
export interface SubComponentSubIngredient {
  /** Firestore document ID of the nested `SubComponent`. */
  subComponentId: string;
  /** Quantity used, in the referenced SubComponent's `yieldUnit`. */
  qty: number;
}

/** Firestore document shape. */
export interface SubComponentDoc {
  /** Infrastructure field — drives migration logic; never shown in UI. */
  _schemaVersion: number;
  /** Display name (e.g. "Tomato Base Sauce", "Brioche Dough"). */
  name: string;
  /** Direct raw material inputs for this sub-component. */
  rawIngredients: SubComponentRawIngredient[];
  /**
   * Nested sub-component inputs (e.g. a sauce that itself requires a stock base).
   * Supports unbounded depth; cycle detection is the back-calculation engine's concern.
   */
  subComponentIngredients: SubComponentSubIngredient[];
  /**
   * Ordered preparation steps. Each element is an HTML string.
   * Rendered via [innerHTML] to support rich formatting (bold, lists, etc.).
   */
  instructions: string[];
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
   * On-hand quantity in `yieldUnit`.
   * Updated by kitchen prep events. 0 = not tracking or not yet stocked.
   */
  currentStock: number;
  /**
   * Minimum on-hand threshold for reorder alerts.
   * When `currentStock < parMinimum` and `parMinimum > 0`, an ALRT-001 alert fires.
   * Defaults to 0 (disabled). Omitted from Firestore when 0.
   */
  parMinimum?: number;
  /**
   * Critical stockout threshold — lower alarm level (should be ≤ parMinimum).
   * Defaults to 0 (disabled). Omitted from Firestore when 0.
   */
  criticalThreshold?: number;
  /**
   * Pre-calculated cost per `yieldUnit`.
   * Computed by CostService and cached; refreshed on ingredient/cost changes.
   */
  calculatedCostPerUnit: number;
  /** Optional free-text notes (storage tips, sourcing info, etc.). */
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
  rawIngredients: [],
  subComponentIngredients: [],
  instructions: [],
  yieldQty: 1,
  yieldUnit: 'kg',
  yieldPercent: 1.0,
  currentStock: 0,
  calculatedCostPerUnit: 0,
};

/**
 * Normalise a raw Firestore snapshot into a fully-typed `SubComponent`.
 *
 * Migration gates:
 *  v1 → v2: `ingredients[]` renamed to `rawIngredients[]`;
 *           `subComponentIngredients`, `instructions`, `currentStock` added with defaults.
 */
export function deserializeSubComponent(raw: unknown): SubComponent {
  const data = (raw ?? {}) as Partial<SubComponentDoc> & {
    ingredients?: SubComponentRawIngredient[];
  };
  const version = data._schemaVersion ?? 0;

  // v1 → v2: migrate legacy `ingredients` field to `rawIngredients`.
  const rawIngredients: SubComponentRawIngredient[] =
    version < 2 ? (data.ingredients ?? []) : (data.rawIngredients ?? []);

  return {
    name: data.name ?? SUB_COMPONENT_DEFAULTS.name,
    rawIngredients,
    subComponentIngredients:
      data.subComponentIngredients ??
      SUB_COMPONENT_DEFAULTS.subComponentIngredients,
    instructions: data.instructions ?? SUB_COMPONENT_DEFAULTS.instructions,
    yieldQty: data.yieldQty ?? SUB_COMPONENT_DEFAULTS.yieldQty,
    yieldUnit: data.yieldUnit ?? SUB_COMPONENT_DEFAULTS.yieldUnit,
    yieldPercent: data.yieldPercent ?? SUB_COMPONENT_DEFAULTS.yieldPercent,
    currentStock: data.currentStock ?? SUB_COMPONENT_DEFAULTS.currentStock,
    calculatedCostPerUnit:
      data.calculatedCostPerUnit ??
      SUB_COMPONENT_DEFAULTS.calculatedCostPerUnit,
    ...(data.parMinimum ? { parMinimum: data.parMinimum } : {}),
    ...(data.criticalThreshold
      ? { criticalThreshold: data.criticalThreshold }
      : {}),
    ...(data.notes ? { notes: data.notes } : {}),
  };
}

/**
 * Produce a null-free Firestore-safe `SubComponentDoc` from the UI-facing `SubComponent`.
 * Optional alert thresholds are omitted when 0 to avoid polluting Firestore
 * with meaningless zeros for operators who do not use sub-component PAR tracking.
 */
export function serializeSubComponent(
  component: SubComponent,
): SubComponentDoc {
  return {
    _schemaVersion: SUB_COMPONENT_SCHEMA_VERSION,
    name: component.name,
    rawIngredients: component.rawIngredients,
    subComponentIngredients: component.subComponentIngredients,
    instructions: component.instructions,
    yieldQty: component.yieldQty,
    yieldUnit: component.yieldUnit,
    yieldPercent: component.yieldPercent,
    currentStock: component.currentStock,
    calculatedCostPerUnit: component.calculatedCostPerUnit,
    ...(component.parMinimum ? { parMinimum: component.parMinimum } : {}),
    ...(component.criticalThreshold
      ? { criticalThreshold: component.criticalThreshold }
      : {}),
    ...(component.notes ? { notes: component.notes } : {}),
  };
}
