# ADMN-007 — Supplier Network Management

| Field | Value |
| :--- | :--- |
| **Shard ID** | ADMN-007 |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Story Ref** | ADMN-007 |
| **Priority** | High |
| **Status** | Completed |
| **Complexity** | M |
| **Depends On** | ADMN-001 |

## Description
Build the admin-side Supplier Network directory. Platform operators curate a list of verified local suppliers (`PlatformVendorDoc`) stored at `vendors/{vendorId}` (top-level collection per ADL-003). This is distinct from restaurant-scoped suppliers (`RestaurantSupplierDoc` at `restaurants/{rId}/suppliers/{supplierId}`). Admin can create supplier profiles, set them as active/inactive, and later invite them to the Vendor Portal.

## Acceptance Criteria
- [ ] Supplier list in `mat-table`: Business Name, Contact Email, Region, Status (Active/Inactive), Portal Access (Yes/No).
- [ ] "Add Supplier" dialog: required fields are business name, contact email, and region. Portal email invite is optional at creation time.
- [ ] "Deactivate" action soft-deletes by setting `status: 'INACTIVE'`. Cannot hard-delete a supplier with active restaurant links.
- [ ] Each supplier row links to a detail page showing their catalog items (implemented in ADMN-008).

## Test Coverage
- [ ] **Unit:** `TenantService.createPlatformVendor()` — mock Firestore; assert document at `vendors/{id}` with `_schemaVersion`.
- [ ] **E2E (T130–T132):** Add "FreshFarms Inc."; confirm table row. Deactivate; confirm status chip changes.

## Dev Notes
- **⚠️ ADL-003:** `PlatformVendorDoc` is at top-level `vendors/{vendorId}`. Restaurant-scoped suppliers live at `restaurants/{rId}/suppliers/{supplierId}` as `RestaurantSupplierDoc`. Do NOT confuse the two collections.
- **Files to create/edit:**
  - `projects/admin/src/app/pages/catalog/suppliers/suppliers.component.ts` + `.html`
  - Add supplier methods to `projects/admin/src/app/services/platform-catalog.service.ts`
- **Model:** `PlatformVendorDoc` — import from `@stockpot/shared`.
- **data-test-ids:** `admn-supplier-list-table`, `admn-supplier-add-btn`, `admn-supplier-row-{id}`, `admn-supplier-deactivate-{id}`
