# ADMN-002 — Tenant (Restaurant) CRUD

| Field | Value |
| :--- | :--- |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | admin |

## User Statement
As a platform operator, I want to create, view, edit, suspend, and reactivate restaurant tenants so that I can manage the full subscriber lifecycle.

## Acceptance Criteria
1. Tenant list at `/admin/tenants` displays all restaurants with columns: name, subscription tier, status (Active/Suspended), and creation date.
2. Admin can create a new tenant: provides restaurant name, primary owner email (triggers an invite email via Firebase Auth), and assigns a subscription tier.
3. Admin can edit tenant details: name, assigned tier, and contact email.
4. Admin can suspend a tenant: sets `status: 'suspended'` in Firestore, which is enforced by a Security Rule that blocks all user-app reads/writes for that restaurant.
5. Admin can reactivate a suspended tenant: sets `status: 'active'`, restoring full access immediately.
6. Destructive actions (suspend, delete) require a confirmation dialog before executing.

## data-test-id List
- `admn-tenant-list-table` — tenant list table
- `admn-tenant-add-button` — create new tenant button
- `admn-tenant-row-{tenantId}` — per-row identifier
- `admn-tenant-suspend-button-{tenantId}` — suspend action per row
- `admn-tenant-reactivate-button-{tenantId}` — reactivate action per row
- `admn-tenant-confirm-dialog` — confirmation dialog for destructive actions
