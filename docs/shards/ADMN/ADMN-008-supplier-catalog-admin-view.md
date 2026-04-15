# ADMN-008 — Supplier Product Catalog Admin View

| Field | Value |
| :--- | :--- |
| **Shard ID** | ADMN-008 |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Story Ref** | ADMN-008 |
| **Priority** | Medium |
| **Status** | Completed |
| **Complexity** | S |
| **Depends On** | ADMN-007, ADMN-006 |

## Description
Add a read-only audit view within the admin supplier detail page showing which platform ingredients a supplier carries, their listed prices, and last updated timestamps. This is a diagnostic view — the admin does not edit prices here (that is the Vendor Portal's responsibility via VNDR-003). Allows the platform operator to audit catalog quality without logging in as the vendor.

## Acceptance Criteria
- [ ] Supplier detail route at `/catalog/suppliers/{vendorId}` renders a product catalog table.
- [ ] Table columns: Ingredient Name, SKU (optional), UoM, Current Price, Last Price Update, Availability.
- [ ] Data sourced from `vendors/{vendorId}/catalog/{itemId}` subcollection (`VendorCatalogItemDoc`).
- [ ] View is read-only; no edit actions on this screen (admin edits happen via ADMN-009).
- [ ] Empty state if no catalog items yet: "No products listed by this supplier."

## Test Coverage
- [ ] **Unit:** `PlatformCatalogService.getVendorCatalog()` — mock subcollection snapshot; assert deserialized items returned.
- [ ] **E2E (T133):** Navigate to a seeded supplier's detail; confirm catalog table renders item rows.

## Dev Notes
- **Files to create/edit:**
  - `projects/admin/src/app/pages/catalog/suppliers/supplier-detail.component.ts` + `.html`
- **Model:** `VendorCatalogItemDoc` — import `deserializeVendorCatalogItem` from `@stockpot/shared`.
- **Firestore path:** `vendors/{vendorId}/catalog/{itemId}` (subcollection).
