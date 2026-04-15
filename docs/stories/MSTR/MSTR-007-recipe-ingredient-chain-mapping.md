# MSTR-007 — Recipe Ingredient Chain Mapping

| Field | Value |
| :--- | :--- |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | MSTR-005 (sub-components), MSTR-006 (recipe) |

## User Statement
As a restaurant owner, I want to map a recipe's ingredients by linking sub-components and direct raw materials with their quantities so that I can see the full theoretical cost per portion of each dish.

## Acceptance Criteria
1. Recipe detail page has an "Ingredients" tab; owner adds ingredients by searching either sub-components or direct raw materials.
2. Each ingredient line includes: item (sub-component or raw material), quantity per batch, and UoM.
3. Theoretical cost per portion is auto-calculated in real time as ingredients are added or quantities changed: `(sum of all line item costs) / batch yield`.
4. Changes to upstream raw material costs automatically cascade and recalculate all dependent sub-component and recipe costs without requiring the owner to re-open the recipe.
5. A recipe with at least one ingredient mapped shows a "Cost Breakdown" expandable section listing each line item's cost contribution.
6. Mixed recipes — combining sub-components and direct raw materials — are fully supported.

## data-test-id List
- `mstr-recipe-ingredients-tab` — ingredients tab on recipe detail
- `mstr-recipe-add-ingredient-search` — type-ahead to add ingredient or sub-component
- `mstr-recipe-ingredient-row-{index}` — per-row identifier
- `mstr-recipe-ingredient-quantity-{index}` — quantity input per row
- `mstr-recipe-ingredient-uom-{index}` — UoM selector per row
- `mstr-recipe-cost-per-portion` — live cost per portion total
- `mstr-recipe-cost-breakdown` — expandable cost breakdown section
