# MSTR-006 — Recipe CRUD & Portion Definition

| Field | Value |
| :--- | :--- |
| **Shard ID** | MSTR-006 |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Story Ref** | MSTR-006 |
| **Priority** | High |
| **Status** | Completed |
| **Complexity** | M |
| **Depends On** | MSTR-005 |

## Description
Build the Recipe management interface for creating and editing menu dishes. Each recipe has core metadata (name, category, selling price, target food cost %) and a portion definition (how many portions a single batch yields). The ingredient chain mapping itself is handled in MSTR-007; this shard covers the recipe header, the CRUD list view, and the recipe card display.

## Acceptance Criteria
- [ ] Recipe list at `/settings/master-data/recipes` with `mat-card` grid or `mat-table` display.
- [ ] "Create Recipe" form: Name (required), Category, Selling Price, Target Food Cost % (default 30%), Portions per Batch.
- [ ] Each recipe shows a summary card: Name, Theoretical Cost, Selling Price, Current Food Cost %, target vs. actual status (green/red badge).
- [ ] Edit and archive actions available per recipe.
- [ ] `RecipeDoc` written using `serializeRecipe()` from `@stockpot/shared` with `parPortions` field (v2 model).

## Test Coverage
- [ ] **Unit:** `RecipeService.create()` — mock Firestore; assert `RecipeDoc` written with `_schemaVersion`, `parPortions` present.
- [ ] **E2E (T215–T216):** Create "Spaghetti Bolognese" recipe with $12 selling price, 30% target; confirm card visible in list.

## Dev Notes
- **Files to create/edit:**
  - `projects/user-app/src/app/pages/master-data/recipes/recipes.component.ts` + `.html`
  - `projects/user-app/src/app/services/recipe.service.ts`
- **Model:** `RecipeDoc` v2 — import `serializeRecipe`, `deserializeRecipe` from `@stockpot/shared`. The v2 model adds `parPortions`. Do NOT use an older `RecipeDoc` interface that lacks this field.
- **Wireframe & Flow:** [Wireframe_Master_Recipes.md](../../context/designs/Wireframe_Master_Recipes.md) · [Flow_Master_Recipes.md](../../context/designs/Flow_Master_Recipes.md)
- **data-test-ids:** `mstr-recipe-list`, `mstr-recipe-add-btn`, `mstr-recipe-name-input`, `mstr-recipe-target-input`, `mstr-recipe-save-btn`, `mstr-recipe-card-{id}`
