# MSTR-005 — Sub-Component CRUD

| Field | Value |
| :--- | :--- |
| **Shard ID** | MSTR-005 |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Story Ref** | MSTR-005 |
| **Priority** | High |
| **Status** | Not Started |
| **Complexity** | M |
| **Depends On** | MSTR-002, MSTR-003 |

## Description
Build the Sub-Component management interface. Sub-components are prepared kitchen intermediates (e.g. "Bolognese Sauce", "Marinated Chicken") that sit between raw materials and final recipes. Each sub-component has a bill-of-materials (list of raw materials + quantities + yield %), a batch yield quantity, and a storage UoM. This is a prerequisite for MSTR-007 (Recipe Ingredient Chain Mapping) as recipes pull from sub-components.

## Acceptance Criteria
- [ ] Sub-Component list page at `/settings/master-data/sub-components` with `mat-table` display.
- [ ] "Create Sub-Component" opens a multi-section form: Name, Batch Yield (qty + UoM), and an ingredient list builder (search raw materials, input qty each).
- [ ] Yield % is per-ingredient — e.g. Onions used have an 85% yield (after trimming loss).
- [ ] Live "Theoretical Cost per Batch" calculation updates as ingredients are added/modified.
- [ ] On save, writes `SubComponentDoc` at `restaurants/{rId}/subComponents/{id}` using `serializeSubComponent()`.
- [ ] Ingredient rows in the builder show their cost contribution to the total.

## Test Coverage
- [ ] **Unit:** `SubComponentService.create()` — mock Firestore write; assert path `restaurants/{rId}/subComponents/{id}`. Cost calculation helper — assert (qty × price / yield%) per ingredient sums correctly.
- [ ] **E2E (T210–T212):** Create "Bolognese Sauce" sub-component with 3 raw material ingredients; confirm total cost displayed; save; confirm in list.

## Dev Notes
- **Files to create/edit:**
  - `projects/user-app/src/app/pages/master-data/sub-components/sub-components.component.ts` + `.html`
  - `projects/user-app/src/app/services/sub-component.service.ts`
  - `projects/user-app/src/app/services/cost.service.ts` (shared calculation helper)
- **Model:** `SubComponentDoc` — import `serializeSubComponent`, `deserializeSubComponent` from `@stockpot/shared`.
- **Cost Service:** Cost calculation logic (`qty × price / yield%`) must be unit-testable — extract to `CostService`, not embedded in the component.
- **data-test-ids:** `mstr-subcomp-list-table`, `mstr-subcomp-add-btn`, `mstr-subcomp-ing-search`, `mstr-subcomp-save-btn`, `mstr-subcomp-total-cost`
