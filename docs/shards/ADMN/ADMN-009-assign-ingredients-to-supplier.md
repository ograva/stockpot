# ADMN-009 — Assign Ingredients to Supplier Catalog

| Field | Value |
| :--- | :--- |
| **Shard ID** | ADMN-009 |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Story Ref** | ADMN-009 |
| **Priority** | High |
| **Status** | Completed |
| **Complexity** | M |
| **Depends On** | ADMN-007, ADMN-006 |

## Description
Allow platform operators to map `PlatformIngredientDoc` entries from the Master Ingredient Catalog onto a supplier's product catalog as `VendorCatalogItemDoc` items. This creates the initial catalog skeleton for a supplier; the vendor can subsequently update prices and availability via the Vendor Portal. This mapping is the source data for auto-pricing in the REPO module.

## Acceptance Criteria
- [ ] From the supplier detail page, an "Add Product" button opens a dialog.
- [ ] Dialog provides a `mat-autocomplete` searchable list of active `PlatformIngredientDoc` entries.
- [ ] Required fields: ingredient reference, initial price, UoM. Optional: vendor-specific SKU.
- [ ] On save, writes a new `VendorCatalogItemDoc` at `vendors/{vendorId}/catalog/{itemId}` using `serializeVendorCatalogItem()`.
- [ ] Cannot add the same ingredient twice to the same supplier catalog (duplicate check).
- [ ] `data-test-id="admn-supplier-add-product-btn"` on the action button.

## Test Coverage
- [ ] **Unit:** `PlatformCatalogService.addProductToSupplier()` — mock Firestore; assert subcollection write; assert duplicate check throws.
- [ ] **E2E (T135):** Add "Roma Tomatoes" to "FreshFarms" catalog at $2.00/Kg; confirm row in supplier catalog view.

## Dev Notes
- **Files:** Extend `projects/admin/src/app/pages/catalog/suppliers/supplier-detail.component.ts`.
- **Model:** `VendorCatalogItemDoc` — import `serializeVendorCatalogItem`, `deserializeVendorCatalogItem` from `@stockpot/shared`. Field `platformIngredientRef` is a Firestore `DocumentReference<PlatformIngredientDoc>`.
- **Price Propagation:** Later, VNDR-003 will fire a Cloud Function when the vendor updates price. This shard only sets the initial price entry.
- **data-test-ids:** `admn-supplier-add-product-btn`, `admn-supplier-ing-select`, `admn-supplier-price-input`, `admn-supplier-product-save-btn`
