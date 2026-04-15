# MSTR-001 — Select Active UoMs from Platform Library

| Field | Value |
| :--- | :--- |
| **Shard ID** | MSTR-001 |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Story Ref** | MSTR-001 |
| **Priority** | High |
| **Status** | Completed |
| **Complexity** | S |
| **Depends On** | AUTH-003, ADMN-005 |

## Description
Allow a restaurant owner to select which UoMs from the platform library are "active" for their restaurant. Active UoMs populate all UoM selectors throughout the tenant's user-app. Stored as a simple array of `platform_uom` document IDs on the `RestaurantDoc`, this lightweight selection screen is a pre-requisite to Raw Material and Recipe setup.

## Acceptance Criteria
- [ ] Settings page at `/settings/master-data/uoms` lists all non-archived platform UoMs.
- [ ] Owner toggles each UoM as active/inactive via a `mat-checkbox` or `mat-slide-toggle`.
- [ ] Selection stored as `activeUomIds: string[]` on the `RestaurantDoc` (partial update — no full document re-write).
- [ ] A minimum of 1 active UoM is required; "Save" is disabled if zero are selected.
- [ ] Changes take effect immediately across all UoM selectors in the app.

## Test Coverage
- [ ] **Unit:** `RestaurantService.setActiveUoms()` — mock Firestore partial update; assert `activeUomIds` array written.
- [ ] **E2E (T200):** Toggle "Kilogram" and "Piece" active; save; reopen page and confirm selection persisted.

## Dev Notes
- **Files to create/edit:**
  - `projects/user-app/src/app/pages/master-data/uoms/active-uoms.component.ts` + `.html`
- **Data flow:** Read active `platform_uom` documents (from Firestore, filtered `archived != true`). Cross-reference with `restaurantDoc.activeUomIds` signal to pre-populate toggle states.
- **Wireframe:** [Wireframe_Master_Raw_Materials.md](../../context/designs/Wireframe_Master_Raw_Materials.md) (UoM selection is a prerequisite to this screen).
