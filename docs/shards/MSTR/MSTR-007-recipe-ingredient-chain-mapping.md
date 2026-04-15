# MSTR-007 — Recipe Ingredient Chain Mapping

| Field | Value |
| :--- | :--- |
| **Shard ID** | MSTR-007 |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Story Ref** | MSTR-007 |
| **Priority** | High |
| **Status** | Not Started |
| **Complexity** | L |
| **Depends On** | MSTR-005, MSTR-006 |

## Description
Build the Recipe Builder ingredient chain editor — the most complex UI in the MSTR module. The builder allows an owner or chef to add Sub-Components and/or direct Raw Materials to a recipe with per-item quantities, and see the live theoretical cost per serving update in real time. A live cost widget in a sticky footer shows current food cost % vs. target, color-coded green/red. An infinite-recursion guard prevents a sub-component from containing itself.

## Acceptance Criteria
- [ ] Builder accessible from the Recipe edit view as a dedicated "Ingredients" tab or section.
- [ ] Two search autocompletes: one for Sub-Components, one for Raw Materials directly.
- [ ] Selecting an item adds it as a row; row has: ingredient name, quantity input (number), UoM display, cost contribution display.
- [ ] Removing a row (`-` button) recalculates cost immediately.
- [ ] Live "Theoretical Cost per Serving" and "Food Cost %" update on every qty change without debounce lag.
- [ ] Save stores ingredient chain on `RecipeDoc.ingredientChain[]` array via `serializeRecipe()`.
- [ ] Adding a sub-component that creates a circular dependency is blocked with an error toast.
- [ ] `data-test-id="mstr-recipe-theor-cost"` on the live cost output.

## Test Coverage
- [ ] **Unit:** `CostService.calcRecipeCost()` — test with nested sub-component chain; assert correct total factoring yield % recursively. Circular dependency detection function — assert detected and returns error.
- [ ] **E2E (T218–T221):** Open "Spaghetti Bolognese"; add "Bolognese Sauce" sub-comp (0.25L) + "Dry Spaghetti" raw mat (150g); confirm cost widget updates; save and confirm persistence.

## Dev Notes
- **Files:** Extend `projects/user-app/src/app/pages/master-data/recipes/recipes.component.ts`. Extend `cost.service.ts` with recursive chain traversal.
- **Circular Dependency Guard:** Before adding a sub-component, traverse its `ingredientChain` tree. If the current recipe ID appears anywhere in the chain, reject the addition.
- **Performance:** The cost calculation traversal is synchronous and client-side. For v1 with < 20 ingredients per recipe, this is well within budget.
- **Wireframe:** [Wireframe_Master_Recipes.md](../../context/designs/Wireframe_Master_Recipes.md) — see the sticky footer live cost widget.
- **data-test-ids:** `mstr-recipe-search-ing`, `mstr-recipe-item-{id}`, `mstr-recipe-item-qty-{id}`, `mstr-recipe-theor-cost`, `mstr-recipe-save-btn`
