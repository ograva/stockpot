# MSTR-010 — Recipe CRUD & Portion Definition (v3 Model)

| Field | Value |
| :--- | :--- |
| **Shard ID** | MSTR-010 |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Story Ref** | MSTR-006 |
| **Priority** | High |
| **Status** | Ready for Review |
| **Complexity** | M |
| **Depends On** | MSTR-009 |
| **Supersedes** | MSTR-006 |

## Description

Rebuild the Recipe management interface to support the v3 `RecipeDoc` model introduced by ADL-008. Two additions are significant for the CRUD form: (1) a `recipeType` selector distinguishing `PRE_MADE` (batch-prepared ahead of time, with finished-portion stock tracking) from `COOKED_TO_ORDER` (assembled fresh per order, no finished-portion inventory); and (2) an ordered `instructions` field for HTML-formatted preparation steps. The `currentStock` field is not manually entered here — it is updated by kitchen prep events (KTCH module) — but must be displayed read-only in the recipe card for PRE_MADE recipes.

## Acceptance Criteria

- [ ] Recipe list at `/settings/master-data/recipes` with `mat-card` grid or `mat-table` display, showing: Name, Type badge (`PRE_MADE` | `COOKED_TO_ORDER`), Category, Selling Price, Theoretical Cost, Food Cost %, and Active status.
- [ ] "Create / Edit Recipe" form includes:
  - **Details:** Name (required), Category (optional), Selling Price (required), Target Food Cost % (default 30%), Portions per Batch (`parPortions`).
  - **Recipe Type:** `mat-radio-group` or `mat-select` with two options:
    - `COOKED_TO_ORDER` — *"Made fresh per order. Ingredient stock is deducted when cooking begins."* (default)
    - `PRE_MADE` — *"Prepared in advance. Finished portions are tracked as inventory."*
  - **Instructions:** Ordered list of preparation steps. Each step is a `<textarea>` stored as an HTML `<p>` string. "Add Step" appends a row; drag handle to reorder. Same pattern as MSTR-009.
- [ ] Recipe summary card shows a `PRE_MADE` badge and current on-hand portion count (`currentStock`) read-only for PRE_MADE recipes. COOKED_TO_ORDER cards do not display a stock count.
- [ ] Edit and archive actions available per recipe.
- [ ] `RecipeDoc` written using `serializeRecipe()` from `@stockpot/shared` with schema version 3. Fields `recipeType`, `instructions`, and `currentStock` (default 0) always present.
- [ ] Existing v1/v2 records load correctly via `deserializeRecipe()` — `recipeType` defaults to `COOKED_TO_ORDER`, `instructions` to `[]`, `currentStock` to `0`.

## Test Coverage

- [ ] **Unit:** `RecipeService.create()` — mock Firestore; assert `RecipeDoc` written with `_schemaVersion: 3`, `recipeType` present, `instructions` array present, `currentStock: 0`.
- [ ] **Unit:** `deserializeRecipe()` with a v2 document (no `recipeType`, no `instructions`, no `currentStock`) — assert all three fields are filled with correct defaults.
- [ ] **Unit:** `deserializeRecipe()` with a v3 PRE_MADE document — assert `recipeType === 'PRE_MADE'` and `currentStock` value is preserved.
- [ ] **E2E (T215–T217):**
  - T215: Create "Spaghetti Bolognese" as COOKED_TO_ORDER with $12 selling price, 30% target; confirm card shows type badge; no stock count visible.
  - T216: Create "Chocolate Chip Cookies" as PRE_MADE; confirm card shows PRE_MADE badge; stock count displayed as 0.
  - T217: Edit "Spaghetti Bolognese"; add 2 instruction steps; save; reload and confirm steps persist.

## Dev Notes

- **Supersedes MSTR-006.** Reference old shard for context on original header-only design.
- **Model:** `RecipeDoc` v3 — import `RecipeType`, `serializeRecipe`, `deserializeRecipe`, `RECIPE_DEFAULTS` from `@stockpot/shared`. Do NOT reference the v2 model (missing `recipeType`, `instructions`, `currentStock`).
- **Files to create/edit:**
  - `projects/user-app/src/app/pages/master-data/recipes/recipes.component.ts` + `.html`
  - `projects/user-app/src/app/services/recipe.service.ts`
- **`currentStock` is read-only in MSTR.** Kitchen prep events (KTCH module) own all writes to `Recipe.currentStock`. MSTR only displays it. Do not add a stock input field here.
- **Instructions pattern:** Identical to MSTR-009. Steps are stored as HTML `<p>` strings. Plain-text `<textarea>` input, wrapped on save. Display uses `[innerHTML]` with Angular sanitization.
- **`recipeType` helper text:** The UI label copy matters here — operators may not understand the technical distinction. Use plain-language descriptions in the radio/select options (see ACs above).
- **Wireframe reference:** [Wireframe_Master_Recipes.md](../../context/designs/Wireframe_Master_Recipes.md) — add the Recipe Type selector in the Details section (left panel on desktop). The recipe card grid adds the type badge.
- **Design tokens:** Follow DesignSystem.md — PRE_MADE badge in `amber-600`, COOKED_TO_ORDER badge in `slate-600`.
- **data-test-ids:**

| Element | `data-test-id` |
| :--- | :--- |
| Recipe list | `mstr-recipe-list` |
| Add button | `mstr-recipe-add-btn` |
| Name input | `mstr-recipe-name-input` |
| Recipe type selector | `mstr-recipe-type-select` |
| PRE_MADE radio option | `mstr-recipe-type-premade` |
| COOKED_TO_ORDER radio option | `mstr-recipe-type-cto` |
| Target cost input | `mstr-recipe-target-input` |
| Add instruction step | `mstr-recipe-add-step-btn` |
| Instruction step textarea | `mstr-recipe-step-{index}` |
| Save button | `mstr-recipe-save-btn` |
| Recipe card | `mstr-recipe-card-{id}` |
| PRE_MADE badge | `mstr-recipe-premade-badge-{id}` |
| Current stock display | `mstr-recipe-stock-{id}` |
