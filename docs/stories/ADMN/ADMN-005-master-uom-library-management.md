# ADMN-005 — Master UoM Library Management

| Field | Value |
| :--- | :--- |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | admin |
| **Downstream Dependency** | MSTR-001 (restaurants select from this library) |

## User Statement
As a platform operator, I want to define and maintain a global list of units of measure with conversion factors so that all restaurants on the platform use consistent measurement definitions without setting them up from scratch.

## Acceptance Criteria
1. UoM records stored at `platform/catalog/uom/{uomId}` with `SCHEMA_VERSION`, `serialize()`, and `deserialize()` functions per DAT-302 pattern.
2. Each record includes: name (e.g., "Kilogram"), abbreviation (e.g., "kg"), base unit reference (e.g., "gram"), and conversion factor (e.g., 1000).
3. Admin can create, edit, and soft-delete (archive) UoM entries; archived entries are flagged `archived: true` and hidden from restaurant selection UIs.
4. Attempting to delete a UoM that is actively referenced by any restaurant's ingredient configuration is blocked with an error message listing the affected tenants.
5. At least 10 standard UoMs (kg, g, L, mL, pcs, dozen, bag, box, tbsp, tsp) are seeded as the default platform library at launch.

## data-test-id List
- `admn-uom-list-table` — UoM list table
- `admn-uom-add-button` — add new UoM button
- `admn-uom-row-{uomId}` — per-row identifier
- `admn-uom-edit-button-{uomId}` — edit action per row
- `admn-uom-archive-button-{uomId}` — archive action per row
- `admn-uom-archive-blocked-error` — error shown when UoM is in use
- `admn-uom-form` — create/edit form container
