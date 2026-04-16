# MSTR-011 — Recipe Ingredient Chain Mapping (DAG Builder)

| Field | Value |
| :--- | :--- |
| **Shard ID** | MSTR-011 |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Story Ref** | MSTR-007 |
| **Priority** | High |
| **Status** | Ready for Review |
| **Complexity** | L |
| **Depends On** | MSTR-009, MSTR-010 |
| **Supersedes** | MSTR-007 |

## Description

Rebuild the Recipe Builder ingredient chain editor to align with the v3 `RecipeDoc` model and the DAG ingredient chain introduced by ADL-008. The builder stores ingredients in two separate typed arrays — `rawIngredients[]` and `subComponentIngredients[]` — not a unified `ingredientChain[]` (which does not exist in the model). Cycle detection is upgraded from a simple self-reference check to a full DAG visited-Set traversal, because sub-components can now themselves contain sub-components. The live theoretical cost calculation must also perform this DAG traversal, correctly factoring `yieldPercent` at every sub-component level.

## Acceptance Criteria

- [ ] Builder accessible from the Recipe edit view as a dedicated "Ingredients" tab or section, rendered after the recipe header (MSTR-010).
- [ ] **Two distinct search autocompletes in one unified ingredient list:**
  - "Add Raw Material" — `mat-autocomplete` searching `restaurants/{rId}/rawMaterials/`.
  - "Add Sub-Component" — `mat-autocomplete` searching `restaurants/{rId}/subComponents/`.
  - Each added item appears in a single ordered list regardless of type; type is identified by an inline chip (`Raw` | `Sub-Comp`).
- [ ] Each ingredient row displays: ingredient name, type chip, qty input (number field), UoM (read-only), and live cost contribution column.
- [ ] Removing a row (`-` icon button) immediately recalculates cost.
- [ ] Live "Theoretical Cost per Serving" and "Food Cost %" sticky footer updates on every qty change with no debounce lag.
- [ ] Food Cost % footer is green if below target, red if at or above target (`color-primary` / `color-error`).
- [ ] On save, writes `rawIngredients[]` and `subComponentIngredients[]` separately on `RecipeDoc` via `serializeRecipe()`. The field `ingredientChain` must **not** be written.
- [ ] **DAG cycle detection:** Before adding sub-component X to the recipe, traverse X's full ingredient chain (including all its nested sub-components) using a visited-Set keyed `"subComponent:{id}"`. If the recipe's own ID or any ancestor ID that would form a loop is encountered, reject the addition with an error snack bar. _Note: Recipes themselves are leaf nodes — a recipe cannot be an ingredient of a sub-component — so the cycle check only traverses sub-component nodes._
- [ ] Ingredients load correctly on edit — existing `rawIngredients[]` and `subComponentIngredients[]` are populated into the unified list on open.

## Test Coverage

- [ ] **Unit:** `CostService.calcRecipeCost(recipe, rawMaterials, subComponents)` — test with: 1 raw material + 1 sub-component that itself contains 1 raw material and 1 nested sub-component. Assert total cost is mathematically correct after applying `yieldPercent` at each sub-component layer. No node should be counted twice (DAG deduplication).
- [ ] **Unit:** `CostService.calcRecipeCost()` — cycle guard: if a visited Set collision is detected mid-traversal, assert function returns a warning flag and uses the cost computed up to that point (does not throw).
- [ ] **Unit:** `RecipeService.save()` — mock Firestore; assert doc written with `rawIngredients` and `subComponentIngredients` arrays; assert `ingredientChain` field is absent.
- [ ] **Unit:** Cycle detection function — sub-component A contains sub-component B; attempting to add A to a chain that already has B returns an error.
- [ ] **E2E (T218–T222):**
  - T218: Open "Spaghetti Bolognese"; add "Bolognese Sauce" sub-component (0.25 L) + "Dry Spaghetti" raw material (150 g); confirm cost widget updates live; save.
  - T219: Reload recipe; confirm ingredient rows are restored with correct quantities.
  - T220: Modify a qty — confirm cost widget updates without page reload.
  - T221: Attempt to add a sub-component whose ingredient chain creates a cycle; confirm error snack bar fires.
  - T222: Remove an ingredient row; confirm cost widget recalculates immediately.

## Dev Notes

- **Supersedes MSTR-007.** The key functional correction: the old shard referenced `RecipeDoc.ingredientChain[]` which does not exist. The correct fields are `rawIngredients: RecipeRawIngredient[]` and `subComponentIngredients: RecipeSubComponentIngredient[]`. All writes and reads must use these two arrays.
- **Model imports:** `RecipeRawIngredient`, `RecipeSubComponentIngredient`, `serializeRecipe`, `SubComponent`, `RawMaterial` from `@stockpot/shared`.
- **Files to create/edit:**
  - `projects/user-app/src/app/pages/master-data/recipes/recipes.component.ts` + `.html` (extend from MSTR-010)
  - `projects/user-app/src/app/services/cost.service.ts` — extend `calcRecipeCost()` with DAG traversal
- **DAG cost traversal algorithm (client-side):**
  ```
  calcRecipeCost(recipe, rawMaterials, subComponents):
    visited = new Set<string>()
    total = 0

    for ing in recipe.rawIngredients:
      total += ing.qty × rawMaterials[ing.rawMaterialId].unitCost

    for ing in recipe.subComponentIngredients:
      total += traverseSubComponent(ing.subComponentId, ing.qty, subComponents, rawMaterials, visited)

    return total

  traverseSubComponent(subCompId, qty, subComponents, rawMaterials, visited):
    key = "subComponent:" + subCompId
    if visited.has(key): warn and return 0   // cycle guard
    visited.add(key)

    sc = subComponents[subCompId]
    effectiveScale = qty / (sc.yieldQty × sc.yieldPercent)
    cost = 0

    for ing in sc.rawIngredients:
      cost += ing.qty × rawMaterials[ing.rawMaterialId].unitCost × effectiveScale

    for ing in sc.subComponentIngredients:
      cost += traverseSubComponent(ing.subComponentId, ing.qty × effectiveScale, ...)

    return cost
  ```
- **Performance:** Traversal is synchronous and client-side. For v1 chains of < 30 total nodes this is well within budget. No memoization required in v1.
- **Wireframe reference:** [Wireframe_Master_Recipes.md](../../context/designs/Wireframe_Master_Recipes.md) — builder panel on right (desktop), sticky footer cost widget.
- **data-test-ids:**

| Element | `data-test-id` |
| :--- | :--- |
| Add raw material search | `mstr-recipe-search-raw` |
| Add sub-component search | `mstr-recipe-search-sub` |
| Ingredient row | `mstr-recipe-item-{id}` |
| Ingredient qty input | `mstr-recipe-item-qty-{id}` |
| Ingredient type chip | `mstr-recipe-item-type-{id}` |
| Remove row button | `mstr-recipe-item-remove-{id}` |
| Theoretical cost display | `mstr-recipe-theor-cost` |
| Food cost % display | `mstr-recipe-food-cost-pct` |
| Save button | `mstr-recipe-save-btn` |
| Cycle error snack bar | `mstr-recipe-cycle-error` |
