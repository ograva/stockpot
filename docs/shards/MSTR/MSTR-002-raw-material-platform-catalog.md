# MSTR-002 — Raw Material Setup — Platform Catalog

| Field | Value |
| :--- | :--- |
| **Shard ID** | MSTR-002 |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Story Ref** | MSTR-002 |
| **Priority** | High |
| **Status** | Completed |
| **Complexity** | M |
| **Depends On** | MSTR-001, ADMN-006 |

## Description
Allow a restaurant owner to add raw materials by searching and selecting from the Master Ingredient Catalog (`platform_ingredients`). Selecting a platform ingredient creates a tenant-scoped `RawMaterialDoc` at `restaurants/{rId}/rawMaterials/{id}` with a `platformIngredientRef`. This is the preferred "Tier 1" path — platform data means pricing automatically reflects Vendor Portal updates.

## Acceptance Criteria
- [ ] Search bar on the Raw Materials list page activates an `mat-autocomplete` sourcing from `platform_ingredients` (non-archived).
- [ ] Selecting a platform ingredient opens a configuration form: Purchase UoM (from active UoMs), Purchase Price, Par Minimum, Critical Threshold, and Primary Supplier (from `restaurants/{rId}/suppliers/`).
- [ ] On save, writes `RawMaterialDoc` with `platformIngredientRef: DocumentReference` and `isCustom: false`.
- [ ] A visual badge distinguishes "Platform" materials from "Custom" ones in the list.
- [ ] `data-test-id="mstr-material-add-btn"`, `data-test-id="mstr-platform-ing-select"`.

## Test Coverage
- [ ] **Unit:** `RawMaterialService.createFromPlatform()` — mock Firestore; assert `RawMaterialDoc` at `restaurants/{rId}/rawMaterials/{id}` with `isCustom: false` and `platformIngredientRef` set.
- [ ] **E2E (T201–T203):** Search "Tomato"; select "Roma Tomatoes"; set price $2/Kg, par 10Kg; save; confirm row in list.

## Dev Notes
- **Files to create/edit:**
  - `projects/user-app/src/app/pages/master-data/raw-materials/raw-materials.component.ts` + `.html`
  - `projects/user-app/src/app/services/raw-material.service.ts`
- **Model:** `RawMaterialDoc` v2 (has `parMinimum`, `criticalThreshold`, `isCustom`) — import from `@stockpot/shared`.
- **ADL-003:** `primarySupplierRef` references `restaurants/{rId}/suppliers/{supplierId}` (RestaurantSupplierDoc), not `vendors/{vendorId}`.
- **Wireframe & Flow:** [Wireframe_Master_Raw_Materials.md](../../context/designs/Wireframe_Master_Raw_Materials.md) · [Flow_Master_Raw_Materials.md](../../context/designs/Flow_Master_Raw_Materials.md)
- **Two-Tier Principle:** A "Platform" badge must always be visible on platform-sourced materials.
- **data-test-ids:** `mstr-material-search`, `mstr-material-add-btn`, `mstr-platform-ing-select`, `mstr-material-save-btn`, `mstr-material-row-{id}`
