# MSTR-004 — Link Raw Material to Supplier

| Field | Value |
| :--- | :--- |
| **Shard ID** | MSTR-004 |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Story Ref** | MSTR-004 |
| **Priority** | High |
| **Status** | Not Started |
| **Complexity** | S |
| **Depends On** | MSTR-002, MSTR-003, ADMN-007 |

## Description
Allow a restaurant owner to associate one or more suppliers with each raw material, designating a primary supplier for auto-PO routing. Suppliers are `RestaurantSupplierDoc` entries at `restaurants/{rId}/suppliers/{supplierId}` — either platform-linked (with a `platformVendorRef`) or manually created. This association is stored directly on the `RawMaterialDoc.primarySupplierRef` and `secondarySupplierRefs[]`.

## Acceptance Criteria
- [ ] Raw material edit dialog/page includes a "Primary Supplier" selector (`mat-select`) showing all restaurant-scoped suppliers.
- [ ] Optional: "Secondary Suppliers" multi-select for fallback sourcing.
- [ ] Supplier selector shows a "Platform" badge next to suppliers linked to `PlatformVendorDoc` entries.
- [ ] On save, `primarySupplierRef` is a Firestore `DocumentReference` to `restaurants/{rId}/suppliers/{supplierId}`.
- [ ] Materials with no supplier assigned display a warning indicator in the list view — they will be excluded from Auto-PO generation.

## Test Coverage
- [ ] **Unit:** `RawMaterialService.updateSupplierLink()` — mock partial update; assert `primarySupplierRef` is a DocumentReference, not a string or `null`.
- [ ] **E2E (T207):** Open "Roma Tomatoes" material; assign "FreshFarms" as primary supplier; save; confirm supplier name visible on list row.

## Dev Notes
- **Files:** Extend `raw-materials.component.ts` and `raw-material.service.ts`. Suppliers loaded via `RestaurantSupplierService`.
- **ADL-003:** `primarySupplierRef` points to `restaurants/{rId}/suppliers/{supplierId}` — NOT `vendors/{vendorId}`.
- **CONSTRAINTS:** Platform vs. Custom supplier distinction must be visible in the dropdown (`isCustom` field on `RestaurantSupplierDoc`).
