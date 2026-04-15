# VNDR-002 — Manage Product Catalog — Add Items

| Field | Value |
| :--- | :--- |
| **Module** | VNDR — Vendor / Supplier Portal |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | vendor-app |
| **Depends On** | VNDR-001 (profile must be complete), ADMN-006 (Master Ingredient Catalog must exist for search) |

## User Statement
As a supplier representative, I want to add the raw material products I carry to my catalog so that restaurants on the platform know exactly what they can order from me.

## Acceptance Criteria
1. Catalog management at `/vendor/catalog`; supplier sees a list of all products they currently carry.
2. "Add Product" flow: supplier searches the Master Ingredient Catalog via type-ahead and selects a matching item, OR enters a custom product name if no match is found.
3. For each catalog entry, supplier sets: price per unit, price UoM, and initial availability status (`IN_STOCK` by default).
4. Custom products (not matched to the Master Catalog) are saved with `isMasterCatalogLinked: false` and an `adminReviewFlag: true` to surface them to the platform admin (ADMN-008).
5. Catalog entries are stored at `vendors/{vendorId}/catalog/{ingredientId}`.
6. Supplier can have a maximum of 500 catalog items in v1.

## data-test-id List
- `vndr-catalog-list` — product catalog list
- `vndr-catalog-add-button` — add product button
- `vndr-catalog-search-input` — master catalog search type-ahead
- `vndr-catalog-search-results` — search results dropdown
- `vndr-catalog-custom-name-input` — custom product name input
- `vndr-catalog-price-input` — price per unit input
- `vndr-catalog-price-uom-select` — price UoM selector
- `vndr-catalog-save-button` — save catalog entry button
- `vndr-catalog-custom-review-badge` — "Pending Review" badge on custom items
