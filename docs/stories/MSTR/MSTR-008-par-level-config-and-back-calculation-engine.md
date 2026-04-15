# MSTR-008 — Par Level Config & Back-Calculation Engine

| Field | Value |
| :--- | :--- |
| **Module** | MSTR — Restaurant Master Data Setup |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | MSTR-007 (full recipe ingredient chain must be mapped) |
| **⚠️ Critical Path** | This story is a hard dependency for the entire REPO module. REPO-001 and REPO-002 cannot function until `rawMaterial.parMinimum` values are computed by this engine. MUST be completed before Sprint 2. |

## User Statement
As a restaurant owner, I want to set the minimum number of portions I must always have available for each recipe and have the system automatically back-calculate the required raw material stock minimums — so that the system knows exactly when to trigger a reorder.

## Acceptance Criteria
1. On each recipe's detail page, owner sets `parPortions` — the minimum number of portions of this recipe that must always be available.
2. On save, a Cloud Function (not client-side logic) traverses the full ingredient chain: `parPortions` → sub-component quantities → raw material minimums, applying yield % at each link in the chain.
3. Computed raw material minimums are written to `rawMaterial.parMinimum` (in storage UoM) on each affected raw material document under `restaurants/{restaurantId}/ingredients/{ingredientId}`.
4. If a raw material is shared by multiple recipes, its `parMinimum` is the **sum** of all contributing recipe requirements.
5. Any change to `parPortions`, a recipe's ingredient chain (MSTR-007), or a sub-component's yield % (MSTR-005) automatically triggers a full recalculation via the same Cloud Function.
6. The recipe detail page shows a "Par Impact" section listing which raw materials were affected and their new calculated `parMinimum` values after each save.

## data-test-id List
- `mstr-recipe-par-portions-input` — par portions input field
- `mstr-recipe-par-save-button` — save par level button
- `mstr-recipe-par-impact-section` — par impact breakdown section
- `mstr-recipe-par-impact-row-{ingredientId}` — per-ingredient impact row
- `mstr-recipe-par-recalculating-indicator` — loading indicator during Cloud Function execution
