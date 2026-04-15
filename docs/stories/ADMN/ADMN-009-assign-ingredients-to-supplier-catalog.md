# ADMN-009 — Assign Ingredients to Supplier Catalog

| Field | Value |
| :--- | :--- |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | admin |

## User Statement
As a platform operator, I want to map ingredients from the Master Catalog to specific supplier product listings so that the auto-pricing flow in restaurants has a verified source of truth.

## Acceptance Criteria
1. On the supplier detail page's catalog tab, admin can add a new product by searching the Master Ingredient Catalog type-ahead.
2. Selecting a Master Catalog ingredient creates a supplier catalog entry linked by `ingredientId`, pre-filling the name and default UoM.
3. Admin sets the initial price and price UoM at the time of mapping; the supplier can update this later from the Vendor Portal.
4. The mapping is stored in `vendors/{vendorId}/catalog/{ingredientId}` with `isMasterCatalogLinked: true`.
5. If the same ingredient is already in the supplier's catalog (added by the supplier themselves), admin can merge the records rather than creating a duplicate.

## data-test-id List
- `admn-catalog-add-ingredient-search` — type-ahead search to add ingredient
- `admn-catalog-add-ingredient-price` — initial price input
- `admn-catalog-add-ingredient-save` — save mapping button
- `admn-catalog-merge-button-{ingredientId}` — merge duplicate records
