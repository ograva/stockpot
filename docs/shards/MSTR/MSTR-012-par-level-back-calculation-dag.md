# MSTR-012 — Par Level Config & Back-Calculation Engine (DAG)

| Field | Value |
| :--- | :--- |
| **Shard ID** | MSTR-012 |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Story Ref** | MSTR-008 |
| **Priority** | High |
| **Status** | Ready for Review |
| **Complexity** | XL |
| **Depends On** | MSTR-011 |
| **Supersedes** | MSTR-008 |

## Description

Rebuild the Par Level configuration UI and the Cloud Function back-calculation engine to support the DAG ingredient chain introduced by ADL-008. The engine must now traverse sub-components that themselves contain sub-components (unbounded depth), using an ephemeral visited-Set keyed by node ID to prevent double-counting and infinite loops. A secondary trigger is added: a write to any `SubComponent` document (yield qty, yield %, or ingredient changes) must also re-trigger back-calculation for all recipes that reference that sub-component (directly or transitively). This shard remains the **critical path dependency** for the entire REPO module.

## Acceptance Criteria

- [ ] Par Level input visible per recipe on `/settings/par-levels` overview page or inline on the recipe card (Owner role only).
- [ ] Saving a `parPortions` value to a `RecipeDoc` triggers the `onRecipeWritten` Cloud Function (Firestore `onDocumentWritten` trigger).
- [ ] A write to any `SubComponentDoc` (ingredient list, yield qty, yield %) triggers `onSubComponentWritten` Cloud Function, which finds all recipes referencing that sub-component (directly or via a nested chain) and re-runs back-calculation for each.
- [ ] **Back-calculation algorithm (Cloud Function):**
  - Input: `recipeId`, `restaurantId`.
  - Load recipe doc; read `parPortions`, `rawIngredients[]`, `subComponentIngredients[]`.
  - Initialise `demand: Map<rawMaterialId, number> = new Map()` and `visited: Set<string> = new Set()`.
  - For each `rawIngredients` entry: `demand[id] += qty × parPortions`.
  - For each `subComponentIngredients` entry: call `traverseSubComponent(subCompId, qty × parPortions, visited, demand)`.
  - `traverseSubComponent`: load sub-component doc; check `visited` (key: `"subComponent:{id}"`); if present, log warning and return; add to visited; compute `effectiveScale = inputQty / (yieldQty × yieldPercent)`; recurse for sub-component's raw and sub-component ingredients.
  - For each `rawMaterialId` in `demand`: write `parMinimum` to `restaurants/{rId}/rawMaterials/{id}` as a partial update (merge: true). Do not overwrite other fields.
- [ ] Calculation completes in < 5 seconds for a DAG of up to 30 total nodes (raw materials + sub-components combined) across all recipes triggered in the batch.
- [ ] `parMinimum` values are visible (read-only) in the Raw Materials list (`mstr-rawmat-par-display-{id}`).
- [ ] If `parPortions = 0` on all recipes referencing a raw material, `parMinimum` is written as `0` (clearing it), not omitted.

## Test Coverage

- [ ] **Unit (Cloud Function) — flat chain:** Mock recipe with 2 raw materials; assert `parMinimum` written to each with correct value (`qty × parPortions`).
- [ ] **Unit (Cloud Function) — nested chain:** Mock recipe → sub-component A (80% yield) → sub-component B (90% yield) → raw material X. Assert `parMinimum` for X is `qty_recipe × qty_A_in_recipe / (yieldQty_A × 0.80) × qty_X_in_A / (yieldQty_A × 0.90)` (compound yield loss).
- [ ] **Unit (Cloud Function) — cycle guard:** Mock a chain where sub-component A references sub-component B, and B references A. Assert function completes without infinite loop; cycle warning logged; `parMinimum` computed from partial traversal without the looping node.
- [ ] **Unit (Cloud Function) — SubComponent trigger:** Mock a `SubComponent` write; assert the function identifies all referencing recipes and triggers back-calculation for each.
- [ ] **Unit (UI):** `ParLevelService.setParPortions()` — mock Firestore write; assert `RecipeDoc.parPortions` updated at correct path.
- [ ] **E2E (T225–T228):**
  - T225: Set `parPortions = 50` for "Spaghetti Bolognese"; wait for back-calc; confirm `RawMaterialDoc.parMinimum` for "Dry Spaghetti" equals `50 × 0.15` kg = 7.5 kg.
  - T226: Change yield % on "Bolognese Sauce" sub-component; confirm "Tomatoes" parMinimum recalculates automatically.
  - T227: Set `parPortions = 0`; confirm parMinimum is written as `0` for all affected raw materials.
  - T228: Chain with 3 levels of nested sub-components; confirm correct parMinimum values accounting for compounded yield loss.

## Dev Notes

- **Supersedes MSTR-008.** The key corrections: (1) old shard referenced `RecipeDoc.ingredientChain[]` — does not exist; use `rawIngredients[]` and `subComponentIngredients[]`. (2) old traversal was flat (one sub-component level only); new traversal is DAG-recursive.
- **⚠️ CRITICAL PATH:** REPO-001, REPO-002 cannot begin until this shard is Completed and E2E T225–T228 pass. Athena must confirm PAR values are mathematically correct before any Auto-PO shard starts.
- **Files to create/edit:**
  - `projects/user-app/src/app/pages/master-data/par-levels/par-levels.component.ts` + `.html`
  - `projects/user-app/src/app/services/par-level.service.ts`
  - `functions/src/handlers/back-calculation.handler.ts` — full rewrite for DAG traversal
  - `functions/src/index.ts` — register both `onRecipeWritten` and `onSubComponentWritten` triggers
- **Cloud Function triggers:**
  - `onDocumentWritten('restaurants/{restaurantId}/recipes/{recipeId}')` → fires when `parPortions` changes.
  - `onDocumentWritten('restaurants/{restaurantId}/subComponents/{subComponentId}')` → fires when yield or ingredients change; must find all recipes that transitively reference this sub-component and re-run.
- **Finding referencing recipes for SubComponent trigger:** In v1, perform a Firestore query for recipes where `subComponentIngredients` array contains the changed sub-component ID. Transitive references (sub-comp of a sub-comp) require loading all sub-components for the restaurant and building the dependency graph in-memory before querying.
- **Model imports (Cloud Function):** Use `functions/src/models/` minimal interface copies for server-side type safety, consistent with `projects/shared/src/models/`. Key fields needed: `RecipeDoc.rawIngredients`, `RecipeDoc.subComponentIngredients`, `RecipeDoc.parPortions`, `SubComponentDoc.rawIngredients`, `SubComponentDoc.subComponentIngredients`, `SubComponentDoc.yieldQty`, `SubComponentDoc.yieldPercent`.
- **Yield formula (compound):** `rawQtyRequired = parPortions × ingredientQty × (1 / (yieldQty × yieldPercent))` per sub-component layer. Multiply the `effectiveScale` through each recursive call — do not recompute at each layer independently.
- **Firestore write:** `setDoc(rawMatRef, { parMinimum: value }, { merge: true })` — never overwrite the full document.
- **Wireframe reference:** [Wireframe_Master_Raw_Materials.md](../../context/designs/Wireframe_Master_Raw_Materials.md) — `parMinimum` is the "Par" column in the data table.
- **data-test-ids:**

| Element | `data-test-id` |
| :--- | :--- |
| Par level input per recipe | `mstr-par-input-{recipeId}` |
| Save PAR button | `mstr-par-save-btn` |
| Raw material PAR display | `mstr-rawmat-par-display-{id}` |
