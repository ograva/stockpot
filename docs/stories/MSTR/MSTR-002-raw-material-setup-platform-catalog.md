# MSTR-002 — Raw Material Setup — Platform Catalog

| Field | Value |
| :--- | :--- |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | ADMN-006 (master ingredient catalog must exist) |

## User Statement
As a restaurant owner, I want to add raw materials by searching the platform's Master Ingredient Catalog so that setup is fast and pricing can be kept current automatically via the Vendor Portal.

## Acceptance Criteria
1. At `/settings/master-data/ingredients`, a type-ahead search queries `platform/catalog/ingredients` and returns matching results.
2. Selecting a platform catalog ingredient pre-fills: name, default UoM, and category. Owner sets: purchase UoM, purchase cost (initial), storage UoM, and yield percentage.
3. The created ingredient record at `restaurants/{restaurantId}/ingredients/{ingredientId}` stores the `platformIngredientRef` (reference to the platform catalog entry).
4. A "Platform Catalog" badge is shown on all platform-linked ingredients in the ingredient list view.
5. If a linked platform ingredient is later archived by admin, the restaurant's ingredient remains functional with its last known data and is flagged "Catalog item archived" in the UI.

## data-test-id List
- `mstr-ingredient-search` — type-ahead search input
- `mstr-ingredient-search-results` — dropdown results list
- `mstr-ingredient-platform-badge` — platform catalog badge
- `mstr-ingredient-form` — ingredient setup form
- `mstr-ingredient-purchase-uom` — purchase UoM selector
- `mstr-ingredient-purchase-cost` — purchase cost input
- `mstr-ingredient-storage-uom` — storage UoM selector
- `mstr-ingredient-yield-percent` — yield percentage input
- `mstr-ingredient-save-button` — save ingredient button
