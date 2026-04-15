# MSTR-005 — Sub-Component CRUD

| Field | Value |
| :--- | :--- |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | MSTR-002 or MSTR-003 (raw materials must exist) |

## User Statement
As a restaurant owner, I want to define sub-components — prepped ingredients like "sliced onions" or "house marinade" — with their yield percentages so that recipe costs accurately account for prep losses.

## Acceptance Criteria
1. Sub-components managed at `/settings/master-data/sub-components`.
2. Each sub-component requires: name, one or more input raw materials with quantities, yield percentage (1–100%), and output UoM.
3. The system auto-calculates the cost per unit of output based on input raw material costs and yield percentage; this calculated cost is displayed in real time as the owner fills the form.
4. Sub-component cannot be saved without at least one raw material mapped.
5. Yield percent field validates between 1 and 100; values outside this range show an inline validation error.
6. Editing a sub-component's yield % or input quantities triggers recalculation of all dependent recipe costs.

## data-test-id List
- `mstr-subcomponent-list` — sub-component list view
- `mstr-subcomponent-add-button` — add new sub-component
- `mstr-subcomponent-form` — create/edit form
- `mstr-subcomponent-name-input` — name input
- `mstr-subcomponent-yield-percent` — yield percentage input
- `mstr-subcomponent-yield-error` — yield validation error
- `mstr-subcomponent-output-uom` — output UoM selector
- `mstr-subcomponent-add-ingredient-row` — add ingredient row button
- `mstr-subcomponent-calculated-cost` — real-time calculated cost display
- `mstr-subcomponent-save-button` — save button
