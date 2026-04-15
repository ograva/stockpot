# MSTR-008 — Par Level Config & Back-Calculation Engine

| Field | Value |
| :--- | :--- |
| **Shard ID** | MSTR-008 |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Story Ref** | MSTR-008 |
| **Priority** | High |
| **Status** | Not Started |
| **Complexity** | XL |
| **Depends On** | MSTR-007 |

## Description
Build the Par Level configuration UI and the Cloud Function back-calculation engine. This is the **critical path dependency for the entire REPO module** — nothing in Sprint 2 replenishment can begin until `RawMaterialDoc.parMinimum` values are reliably computed. The UI allows an owner to set `parPortions` per recipe (the minimum daily portions to maintain). The Cloud Function then traverses the full ingredient chain and back-calculates the minimum raw material stock required to produce those portions, accounting for sub-component yield percentages at every link.

## Acceptance Criteria
- [ ] Par Level input visible per recipe (inline field or dedicated `/settings/par-levels` overview page).
- [ ] Saving a `parPortions` value triggers the `onRecipeParLevelWritten` Cloud Function.
- [ ] Cloud Function traverses: `parPortions` → recipe `ingredientChain[]` → sub-component yield % → raw material storage UoM quantity.
- [ ] Calculates and writes `parMinimum` to each affected `RawMaterialDoc` (partial update — does not overwrite other fields).
- [ ] Any change to `parPortions`, recipe ingredient chain, OR a sub-component's yield % re-triggers a full recalculation.
- [ ] Recalculation is complete in < 5 seconds for a chain of up to 20 ingredients.
- [ ] `parMinimum` values visible (read-only) next to each raw material in the Raw Materials list.

## Test Coverage
- [ ] **Unit (Cloud Function):** Mock Firestore trigger with a known recipe/sub-component/raw material chain; assert `parMinimum` written to each referenced `RawMaterialDoc` with mathematically correct values. Test yield % impact (e.g. 90% yield on 1Kg = 1.111Kg raw quantity needed to produce 1Kg net).
- [ ] **Unit (UI):** `ParLevelService.setParPortions()` — mock Firestore write; assert write triggers the function via Firestore document update.
- [ ] **E2E (T225–T227):** Set `parPortions = 50` for "Spaghetti Bolognese"; trigger back-calc; confirm `RawMaterialDoc.parMinimum` for "Onions" equals expected value based on recipe math.

## Dev Notes
- **⚠️ CRITICAL PATH:** REPO-001, REPO-002 cannot begin until this shard is **Completed** and verified. Athena must confirm PAR values are correct before any Auto-PO shard starts.
- **Files to create/edit:**
  - `projects/user-app/src/app/pages/master-data/par-levels/par-levels.component.ts` + `.html`
  - `functions/src/handlers/back-calculation.handler.ts` — Cloud Function handler
  - `functions/src/index.ts` — register `onRecipeParLevelWritten` trigger
- **Cloud Function trigger:** `onDocumentWritten('restaurants/{restaurantId}/recipes/{recipeId}')` — fires on `parPortions` field change.
- **Model:** `RawMaterialDoc.parMinimum` is the output field. Import `deserializeRawMaterial`, `serializeRawMaterial` from `@stockpot/shared` within the function (or use the minimal interfaces in `functions/src/models/`).
- **Yield formula:** `rawQtyRequired = portionsNeeded × ingredientQtyPerPortion / yieldDecimal` where `yieldDecimal = yieldPercent / 100`.
- **Wireframe:** [Wireframe_Master_Raw_Materials.md](../../context/designs/Wireframe_Master_Raw_Materials.md) — `parMinimum` is the "Par" value shown in the list.
- **data-test-ids:** `mstr-par-input-{recipeId}`, `mstr-par-save-btn`, `mstr-rawmat-par-display-{id}`
