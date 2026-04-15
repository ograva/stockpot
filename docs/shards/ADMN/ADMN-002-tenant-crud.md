# ADMN-002 — Tenant (Restaurant) CRUD

| Field | Value |
| :--- | :--- |
| **Shard ID** | ADMN-002 |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Story Ref** | ADMN-002 |
| **Priority** | High |
| **Status** | Not Started |
| **Complexity** | M |
| **Depends On** | ADMN-001 |

## Description
Build the Tenant management interface in the admin app where platform operators can view, create, edit, suspend, and reactivate restaurant tenants. Each tenant is a `RestaurantDoc` at `restaurants/{restaurantId}`. Suspension sets `status: 'SUSPENDED'` on the document — it does not delete any data. The admin app reads the `restaurants` collection with no tenant isolation (platform-level access).

## Acceptance Criteria
- [ ] Tenant list view (`mat-table`) displays: restaurant name, owner email, subscription tier, status, created date.
- [ ] "Add Tenant" opens a `mat-dialog` form; on save, writes `RestaurantDoc` via `TenantService.createTenant()` using `serializeRestaurant()`.
- [ ] Edit pencil opens a pre-populated dialog for updating name, address, timezone.
- [ ] "Suspend" action sets `status: 'SUSPENDED'`; "Reactivate" sets `status: 'ACTIVE'`. Neither action deletes data.
- [ ] Table has `data-test-id="admn-tenant-list-table"`. Add button has `data-test-id="admn-tenant-add-button"`.
- [ ] Paginated: 25 rows per page.

## Test Coverage
- [ ] **Unit:** `TenantService.createTenant()` — mock Firestore; assert correct document path and `serializeRestaurant()` call. `TenantService.suspendTenant()` — assert partial update with `status: 'SUSPENDED'`.
- [ ] **E2E (T110–T113):** `e2e/admin/flows/tenants/` — Create new tenant; verify row appears in table. Suspend tenant; verify status chip changes. Reactivate; verify status restored.

## Dev Notes
- **Files to create/edit:**
  - `projects/admin/src/app/pages/tenants/tenants.component.ts` + `.html`
  - `projects/admin/src/app/services/tenant.service.ts`
- **Model:** `RestaurantDoc` — import `serializeRestaurant`, `deserializeRestaurant` from `@stockpot/shared`.
- **ADL:** `RestaurantDoc` has a `status` field (v2 model). Do NOT use the pre-v2 model which lacked status.
- **data-test-ids:** `admn-tenant-list-table`, `admn-tenant-add-button`, `admn-tenant-row-{id}`, `admn-tenant-suspend-{id}`, `admn-tenant-save-btn`
