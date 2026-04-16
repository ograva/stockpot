# MSTR-009 — Sub-Component CRUD (v2 Model)

| Field | Value |
| :--- | :--- |
| **Shard ID** | MSTR-009 |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Story Ref** | MSTR-005 |
| **Priority** | High |
| **Status** | Ready for Review |
| **Complexity** | L |
| **Depends On** | MSTR-002, MSTR-003 |
| **Supersedes** | MSTR-005 |

## Description

Rebuild the Sub-Component management interface to support the v2 `SubComponentDoc` model introduced by ADL-008. A sub-component is now a full intermediate recipe: it can contain raw materials **and** other sub-components as ingredients (unbounded DAG nesting), carries ordered HTML preparation instructions, tracks on-hand batch stock (`currentStock`), and optionally supports PAR-level reorder alerting (`parMinimum`, `criticalThreshold`) for operators who pre-batch intermediates. Operators who do not track sub-component stock can leave those fields at 0/blank — they are omitted from Firestore entirely when empty.

## Acceptance Criteria

- [ ] Sub-Component list page at `/settings/master-data/sub-components` with `mat-table`, showing Name, Yield, Unit Cost per Yield Unit, and Current Stock columns.
- [ ] "Create / Edit Sub-Component" opens a multi-section dialog or dedicated route with the following sections:
  - **Details:** Name (required), Batch Yield qty + UoM (required), Yield % (default 100%, range 1–100%), optional Notes.
  - **Raw Ingredient Lines:** `mat-autocomplete` search of `RawMaterial` records; each row shows material name, qty input, UoM (read-only from material), and cost contribution.
  - **Sub-Component Lines:** Separate `mat-autocomplete` search of existing `SubComponent` records; each row shows sub-component name, qty input, UoM (read-only from sub-component `yieldUnit`), and cost contribution. Selecting a sub-component that creates a cycle (detected via visited-Set traversal — see Dev Notes) is blocked with an error snack bar.
  - **Instructions:** Ordered list of preparation steps. Each step is a plain-text `<textarea>` stored as an HTML string. "Add Step" appends a row; drag handle to reorder. Rendered with `[innerHTML]` in kitchen-facing read views.
  - **Stock & PAR (optional section, collapsed by default):** `currentStock` numeric input (on-hand quantity in `yieldUnit`). `parMinimum` and `criticalThreshold` numeric inputs with helper text: *"Leave at 0 to disable batch-level alerts."* Fields are omitted from Firestore write when value is 0.
- [ ] Live "Theoretical Cost per Yield Unit" updates on every qty or ingredient change. Formula: `Σ(ingredient costs) / (yieldQty × yieldPercent)`.
- [ ] On save, writes `SubComponentDoc` at `restaurants/{rId}/subComponents/{id}` via `serializeSubComponent()`. Schema version 2 is always written.
- [ ] On delete, warns if any Recipe or other SubComponent references this sub-component before confirming removal.
- [ ] Existing v1 records (with legacy `ingredients[]` field) load correctly via `deserializeSubComponent()` migration gate.

## Test Coverage

- [ ] **Unit:** `CostService.calcSubComponentCost()` — given a sub-component with 2 raw ingredients and 1 nested sub-component ingredient, assert total cost and per-yield-unit cost are correct factoring `yieldPercent`.
- [ ] **Unit:** `SubComponentService.create()` — mock Firestore; assert `SubComponentDoc` written to `restaurants/{rId}/subComponents/{id}` with `_schemaVersion: 2`, `rawIngredients[]`, `subComponentIngredients[]`, `instructions[]` present.
- [ ] **Unit:** `deserializeSubComponent()` with a v1 document (has `ingredients[]`, no `subComponentIngredients`) — assert `rawIngredients` is populated from the legacy field, `subComponentIngredients` defaults to `[]`.
- [ ] **Unit:** Cycle detection — given sub-component A containing sub-component B, attempting to add A as an ingredient of B returns an error.
- [ ] **E2E (T210–T214):**
  - T210: Create "Herb Oil" sub-component with 2 raw ingredients; confirm cost displays; save; confirm in list.
  - T211: Edit "Herb Oil"; add a nested sub-component ingredient ("Spice Blend"); confirm cost recalculates; save.
  - T212: Attempt to add "Herb Oil" as an ingredient of itself; confirm cycle error toast appears.
  - T213: Set `parMinimum = 5` and `criticalThreshold = 2` on a sub-component; save; confirm values persist on reload.
  - T214: Load a v1 sub-component from emulator seed data; confirm it displays correctly with no errors.

## Dev Notes

- **Supersedes MSTR-005.** Reference the old shard for context on the original flat-ingredient design.
- **Model:** `SubComponentDoc` v2 — import `SubComponentRawIngredient`, `SubComponentSubIngredient`, `serializeSubComponent`, `deserializeSubComponent`, `SUB_COMPONENT_DEFAULTS` from `@stockpot/shared`. Do NOT use the v1 `SubComponentIngredient` type (renamed to `SubComponentRawIngredient`).
- **Files to create/edit:**
  - `projects/user-app/src/app/pages/master-data/sub-components/sub-components.component.ts` + `.html`
  - `projects/user-app/src/app/services/sub-component.service.ts`
  - `projects/user-app/src/app/services/cost.service.ts` — add `calcSubComponentCost()` with DAG traversal
- **Cycle Detection (client-side, for UI guard only):** Before adding sub-component X as an ingredient of the current sub-component being edited, call `traverseSubComponentIngredients(X.id, visited: Set<string>)`. The visited Set is keyed as `"subComponent:{id}"`. If the current sub-component's own ID appears in the traversal, reject. This is a client-side UX guard — the back-calculation engine has its own server-side guard.
- **Optional PAR fields:** Omit from `serializeSubComponent()` call when value is `0` — the model's serialize function already handles this via conditional spread. UI must send `undefined` not `0` for empty/cleared fields.
- **Instructions rendering:** Steps are stored as HTML strings. The input textarea collects plain text and wraps in `<p>` tags on save. Display uses `[innerHTML]` with Angular's built-in sanitization.
- **Wireframe reference:** No dedicated sub-component wireframe exists. Use Wireframe_Master_Raw_Materials.md as the list layout reference and Wireframe_Master_Recipes.md for the ingredient-builder panel pattern.
- **Design tokens:** Follow DesignSystem.md — Primary `#155e30`, surface `#f8fafc`, error `#e11d48`.
- **data-test-ids:**

| Element | `data-test-id` |
| :--- | :--- |
| Sub-component list table | `mstr-subcomp-list-table` |
| Add button | `mstr-subcomp-add-btn` |
| Name input | `mstr-subcomp-name-input` |
| Raw ingredient search | `mstr-subcomp-raw-search` |
| Sub-component ingredient search | `mstr-subcomp-sub-search` |
| Ingredient row (raw) | `mstr-subcomp-raw-row-{id}` |
| Ingredient row (sub) | `mstr-subcomp-sub-row-{id}` |
| Qty input per row | `mstr-subcomp-qty-{id}` |
| Add instruction step | `mstr-subcomp-add-step-btn` |
| Instruction step textarea | `mstr-subcomp-step-{index}` |
| currentStock input | `mstr-subcomp-stock-input` |
| parMinimum input | `mstr-subcomp-par-input` |
| criticalThreshold input | `mstr-subcomp-critical-input` |
| Live cost output | `mstr-subcomp-total-cost` |
| Save button | `mstr-subcomp-save-btn` |
| Cycle error snackbar | `mstr-subcomp-cycle-error` |
