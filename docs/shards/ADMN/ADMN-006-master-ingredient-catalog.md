# ADMN-006 — Master Ingredient Catalog Management

| Field | Value |
| :--- | :--- |
| **Shard ID** | ADMN-006 |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Story Ref** | ADMN-006 |
| **Priority** | High |
| **Status** | Completed |
| **Complexity** | M |
| **Depends On** | ADMN-005 |

## Description
Build the Master Ingredient Catalog interface within the admin Platform Catalog section. This is the global raw material list that restaurants search when setting up their local `RawMaterialDoc` — it is the top of the Two-Tier Data hierarchy. Ingredients are stored at `platform_ingredients/{ingredientId}` (per ADL-002). Each ingredient references a `PlatformUomDoc` as its default unit of measure.

## Acceptance Criteria
- [ ] Ingredient list in `mat-table`: Name, Category, Default UoM (linked to `platform_uom`), Description, Status.
- [ ] "Add Ingredient" dialog: required fields are name and default UoM (`mat-autocomplete` sourced from active UoMs). Optional: category, description, default yield %.
- [ ] Archive action sets `archived: true`; archived ingredients are hidden from restaurant search lookups immediately.
- [ ] Archived ingredients retain existing `RawMaterialDoc` references for historical cost calculations — they are not deleted.
- [ ] Search/filter bar above the table filters by name client-side.

## Test Coverage
- [ ] **Unit:** `PlatformCatalogService.createIngredient()` — mock Firestore; assert path `platform_ingredients/{id}`, `_schemaVersion` present, `defaultUomRef` is a Firestore DocumentReference. Archive — assert partial update `{ archived: true }`.
- [ ] **E2E (T125–T127):** Create "Roma Tomatoes" ingredient with UoM "Kilogram"; confirm in table. Archive it; confirm hidden from restaurant UoM picker fixture.

## Dev Notes
- **⚠️ ADL-002:** Collection is `platform_ingredients/{ingredientId}` — NOT `platform/catalog/ingredients/{ingredientId}`.
- **Files to create/edit:**
  - `projects/admin/src/app/pages/catalog/ingredients/ingredients.component.ts` + `.html`
  - Add ingredient methods to `projects/admin/src/app/services/platform-catalog.service.ts`
- **Model:** `PlatformIngredientDoc` — import from `@stockpot/shared`. `defaultUomRef` is a Firestore `DocumentReference<PlatformUomDoc>`.
- **data-test-ids:** `admn-ing-list-table`, `admn-ing-add-button`, `admn-ing-row-{id}`, `admn-dialog-save-btn`
