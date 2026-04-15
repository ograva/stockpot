# REPO-001 — Shortfall Dashboard

| Field | Value |
| :--- | :--- |
| **Module** | REPO — Smart PO & Replenishment Engine |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | user-app |
| **Depends On** | MSTR-008 (`rawMaterial.parMinimum` must be computed) |

## User Statement
As a kitchen manager, I want to see all raw materials currently below their par minimum in one view so that I can immediately assess what needs to be ordered at the start of my shift.

## Acceptance Criteria
1. Dashboard at `/replenishment` lists all ingredients where `currentStock < parMinimum`, sorted by shortfall severity (largest shortfall first).
2. Each row shows: ingredient name, current stock (with UoM), par minimum (with UoM), shortfall quantity, and primary assigned supplier.
3. Platform-linked supplier rows display the live price from the Vendor Portal with a "Live Price" badge. Custom supplier rows show the manually entered price with a "Manual Price" badge.
4. Items with an out-of-stock flag from their primary supplier are highlighted with an amber warning and suggest the secondary supplier if one is configured.
5. Dashboard refreshes in real time as Firestore `currentStock` values change — no manual page reload required.

## data-test-id List
- `repo-shortfall-table` — shortfall table container
- `repo-shortfall-row-{ingredientId}` — per-ingredient row
- `repo-shortfall-live-price-badge-{ingredientId}` — live price badge
- `repo-shortfall-manual-price-badge-{ingredientId}` — manual price badge
- `repo-shortfall-oos-warning-{ingredientId}` — out-of-stock supplier warning
- `repo-shortfall-empty-state` — empty state when all stock is above par
