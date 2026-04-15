# MSTR-006 — Recipe CRUD & Portion Definition

| Field | Value |
| :--- | :--- |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | user-app |

## User Statement
As a restaurant owner, I want to create and manage recipes with portion counts and serving sizes so that the system knows exactly what one portion of each dish consumes.

## Acceptance Criteria
1. Recipes managed at `/settings/master-data/recipes`.
2. Each recipe requires: name, batch yield (number of portions per batch), and serving UoM (e.g., "plate", "cup", "100g portion").
3. Recipe can optionally include: category (e.g., "Main", "Side", "Beverage"), selling price, and preparation notes.
4. A recipe is saved without ingredients mapped — ingredients are mapped in MSTR-007 as a separate step. This allows the recipe skeleton to be created first.
5. Recipes list view shows: name, batch yield, number of ingredients mapped, and calculated cost per portion (once ingredients are mapped).

## data-test-id List
- `mstr-recipe-list` — recipe list view
- `mstr-recipe-add-button` — add new recipe button
- `mstr-recipe-form` — create/edit form
- `mstr-recipe-name-input` — name input
- `mstr-recipe-batch-yield` — batch yield input
- `mstr-recipe-serving-uom` — serving UoM selector
- `mstr-recipe-category-select` — category selector
- `mstr-recipe-selling-price` — selling price input
- `mstr-recipe-save-button` — save button
- `mstr-recipe-cost-per-portion` — calculated cost per portion display
