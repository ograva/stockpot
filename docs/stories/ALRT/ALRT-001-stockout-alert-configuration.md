# ALRT-001 — Stockout Alert Configuration

| Field | Value |
| :--- | :--- |
| **Module** | ALRT — Alert Engine |
| **Sprint** | 3 |
| **Priority** | High |
| **App** | user-app + Cloud Functions |
| **Access** | `owner` role only for configuration; alerts delivered to `owner` and `manager` roles |

## User Statement
As a restaurant owner, I want to configure a critical stock threshold per raw material so that I receive an alert before any ingredient drops to a level that would disrupt kitchen service.

## Acceptance Criteria
1. Per raw material, owner sets a `criticalThreshold` value (in the ingredient's storage UoM) on the ingredient detail page under `/settings/master-data/ingredients/{ingredientId}`.
2. A Firestore Cloud Function trigger fires when a `currentStock` write at or below `criticalThreshold` is detected.
3. Alert fires only once per threshold breach — not repeatedly with every downward stock change — until stock is replenished above the threshold.
4. Alert settings stored at `restaurants/{restaurantId}/alertConfig/{ingredientId}` per the DAT-302 pattern with `SCHEMA_VERSION`.
5. Owner can independently enable or disable the alert per ingredient without affecting the par minimum (MSTR-008) or Auto-PO trigger logic.
6. The `criticalThreshold` is distinct from and typically lower than `parMinimum`: par minimum triggers a reorder suggestion; critical threshold triggers an urgent alert.

## data-test-id List
- `alrt-threshold-input-{ingredientId}` — critical threshold input on ingredient detail
- `alrt-threshold-toggle-{ingredientId}` — enable/disable alert toggle per ingredient
- `alrt-threshold-save-button` — save threshold settings
- `alrt-threshold-par-comparison` — visual indicator showing threshold vs. par minimum
