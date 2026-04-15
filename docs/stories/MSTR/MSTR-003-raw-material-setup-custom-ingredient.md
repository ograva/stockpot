# MSTR-003 — Raw Material Setup — Custom Ingredient

| Field | Value |
| :--- | :--- |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | user-app |

## User Statement
As a restaurant owner, I want to add a custom raw material that is not in the platform's Master Ingredient Catalog so that I can track any ingredient unique to my kitchen.

## Acceptance Criteria
1. On the ingredient setup form, if the type-ahead search returns no results or the owner chooses "Add Custom Ingredient," a fully editable form is presented with no pre-filled platform data.
2. Required fields for a custom ingredient: name, purchase UoM, purchase cost, storage UoM, yield percentage.
3. Custom ingredient is stored at `restaurants/{restaurantId}/ingredients/{ingredientId}` with `platformIngredientRef: null`.
4. Custom ingredients display with a "Custom" badge (visually distinct from the "Platform Catalog" badge from MSTR-002).
5. Saving a custom ingredient does NOT create or modify any record in the `platform/catalog/ingredients` collection.

## data-test-id List
- `mstr-ingredient-add-custom-button` — add custom ingredient button
- `mstr-ingredient-custom-form` — custom ingredient form
- `mstr-ingredient-name-input` — name input for custom ingredient
- `mstr-ingredient-custom-badge` — custom badge on ingredient list
- `mstr-ingredient-save-button` — save button
