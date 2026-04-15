# MSTR-003 — Raw Material Setup — Custom Ingredient

| Field | Value |
| :--- | :--- |
| **Shard ID** | MSTR-003 |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Story Ref** | MSTR-003 |
| **Priority** | High |
| **Status** | Completed |
| **Complexity** | S |
| **Depends On** | MSTR-001 |

## Description
Allow a restaurant owner to add a fully custom raw material not present in the master ingredient catalog. Creates a `RawMaterialDoc` with `isCustom: true` and no `platformIngredientRef`. Custom materials require manual price maintenance since there is no platform pricing feed connected. The UI must visually distinguish custom materials from platform-sourced ones so the owner understands the maintenance implication.

## Acceptance Criteria
- [ ] "Add Custom Ingredient" button on the Raw Materials page opens a separate form/dialog (distinct from the platform search flow in MSTR-002).
- [ ] Required fields: ingredient name, purchase UoM, initial price. Optional: description, default yield %.
- [ ] On save, writes `RawMaterialDoc` with `isCustom: true`; `platformIngredientRef` field omitted (not written as `null`).
- [ ] Custom materials show a "Custom" badge (`bg-slate-100 text-secondary`) in the list view.
- [ ] Owner can convert a custom material to a platform-linked one at a later date (optional stretch — not required for this shard).

## Test Coverage
- [ ] **Unit:** `RawMaterialService.createCustom()` — mock Firestore; assert `isCustom: true`, assert `platformIngredientRef` key is absent from the written document.
- [ ] **E2E (T205):** Add custom ingredient "House Spice Blend"; set price; save; confirm "Custom" badge visible in list.

## Dev Notes
- **Files:** Extend `projects/user-app/src/app/pages/master-data/raw-materials/raw-materials.component.ts` and `raw-material.service.ts`.
- **Model:** `RawMaterialDoc` — use conditional spread pattern: `...(platformIngredientRef ? { platformIngredientRef } : {})`. Never write `null`.
- **Two-Tier Principle:** Custom badge is mandatory. The PRD states "This distinction must be visible in the UI at all times."
