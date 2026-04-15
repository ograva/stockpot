# ADMN-006 — Master Ingredient Catalog Management

| Field | Value |
| :--- | :--- |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | admin |
| **Downstream Dependency** | MSTR-002 (restaurants search this catalog), VNDR-002 (vendors list items from this catalog) |

## User Statement
As a platform operator, I want to maintain a global catalog of raw material ingredients so that restaurants can quickly find standard ingredients without entering them from scratch, and suppliers can reference the same canonical items.

## Acceptance Criteria
1. Ingredients stored at `platform/catalog/ingredients/{ingredientId}` with `SCHEMA_VERSION`, `serialize()`, and `deserialize()`.
2. Each entry includes: name, category (e.g., "Proteins", "Dairy", "Produce"), default UoM reference (from ADMN-005 library), and optional description.
3. Admin can create, edit, and archive ingredient entries; archived items no longer appear in restaurant or vendor search results.
4. Archived ingredients retain all historical records — any restaurant that previously linked to this ingredient is not affected by archiving.
5. Catalog can be searched and filtered by category; supports at least 200 pre-seeded ingredient entries at launch.
6. Admin can bulk-import ingredients via CSV (required columns: name, category, defaultUomId).

## data-test-id List
- `admn-ingredients-list-table` — ingredient catalog table
- `admn-ingredients-search` — search input
- `admn-ingredients-category-filter` — category filter dropdown
- `admn-ingredients-add-button` — add new ingredient button
- `admn-ingredients-row-{ingredientId}` — per-row identifier
- `admn-ingredients-archive-button-{ingredientId}` — archive action
- `admn-ingredients-bulk-import-button` — bulk CSV import button
