# ADMN-005 — Master UoM Library Management

| Field | Value |
| :--- | :--- |
| **Shard ID** | ADMN-005 |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Story Ref** | ADMN-005 |
| **Priority** | High |
| **Status** | Completed |
| **Complexity** | M |
| **Depends On** | ADMN-001 |

## Description
Build the Unit of Measure (UoM) management interface within the admin app's Platform Catalog section. Platform operators create and maintain a global UoM library (Kilogram, Liter, Piece, etc.) that all restaurant tenants consume as lookup data. Each UoM record is stored at `platform_uom/{uomId}` (flat path per ADL-002). Soft delete via `archived: true` — no hard deletes.

## Acceptance Criteria
- [ ] UoM list displayed in `mat-table` with columns: Name, Abbreviation, Type (Weight/Volume/Count), Conversion Factor, Status.
- [ ] "Add UoM" button opens `mat-dialog`; required fields: name, abbreviation, type, conversion factor (to base SI unit).
- [ ] Edit action opens pre-populated dialog. Save updates via `PlatformCatalogService.updateUom()`.
- [ ] "Archive" action sets `archived: true` on the document. Archived UoMs are hidden from the default list (toggle to show archived).
- [ ] Attempting to archive a UoM actively used by any restaurant ingredient returns a blocking error toast.
- [ ] `data-test-id="admn-uom-list-table"` on table and `data-test-id="admn-uom-add-button"` on add button.

## Test Coverage
- [ ] **Unit:** `PlatformCatalogService.createUom()` — mock Firestore; assert document written at `platform_uom/{id}` with `_schemaVersion`. `PlatformCatalogService.archiveUom()` — assert partial update `{ archived: true }`, never deletes.
- [ ] **E2E (T120–T123):** `e2e/admin/flows/catalog/` — Add "Tablespoon"; confirm row appears. Archive it; confirm hidden. Re-show archived; confirm visible.

## Dev Notes
- **⚠️ ADL-002 (CRITICAL):** Collection path is `platform_uom/{uomId}` — **NOT** `platform/catalog/uom/{uomId}`. The PRD ACs reference the old nested path; this shard uses the flat path as decided.
- **Files to create/edit:**
  - `projects/admin/src/app/pages/catalog/uom/uom.component.ts` + `.html`
  - `projects/admin/src/app/services/platform-catalog.service.ts` (UoM methods)
- **Model:** `PlatformUomDoc` — import `serializePlatformUom`, `deserializePlatformUom` from `@stockpot/shared`.
- **Wireframe & Flow:** [Wireframe_Admin_Platform_Catalog.md](../../context/designs/Wireframe_Admin_Platform_Catalog.md) · [Flow_Platform_Catalog.md](../../context/designs/Flow_Platform_Catalog.md)
- **data-test-ids:** `admn-uom-list-table`, `admn-uom-add-button`, `admn-uom-row-{id}`, `admn-dialog-save-btn`
