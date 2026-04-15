# AUTH-003 — First-Run Restaurant Setup Wizard

| Field | Value |
| :--- | :--- |
| **Shard ID** | AUTH-003 |
| **Module** | AUTH — User-App Authentication & Onboarding |
| **Story Ref** | AUTH-003 |
| **Priority** | High |
| **Status** | Not Started |
| **Complexity** | M |
| **Depends On** | AUTH-001, AUTH-002 |

## Description
Build the first-run setup wizard that fires on initial `owner` login when no `restaurants/{restaurantId}` document exists in Firestore. The wizard is a 3-step `mat-stepper` (Profile → Team → Seed Catalog) rendered inside `BlankLayout`. On completion, it creates the tenant document using `serializeRestaurant()` with `RESTAURANT_SCHEMA_VERSION`, then redirects the owner to the main dashboard. Subsequent logins detect the existing tenant document and skip the wizard entirely.

## Acceptance Criteria
- [ ] Wizard triggers only when `restaurants/{restaurantId}` document does not exist after login.
- [ ] Step 1 collects restaurant name (required), currency (default PHP), and timezone (default Asia/Manila).
- [ ] Step 2 allows inviting managers/staff by email (optional; "Skip" is valid).
- [ ] Step 3 offers one-tap seed of active UoMs and common ingredients from platform catalogs.
- [ ] On "Finish", writes `restaurants/{restaurantId}` using `serializeRestaurant()` from `@stockpot/shared`.
- [ ] User cannot advance a step without completing required fields; "Next" button disabled if form invalid.
- [ ] Container has `data-test-id="auth-setup-wizard"`. Finish button `data-test-id="auth-setup-finish-btn"`.

## Test Coverage
- [ ] **Unit:** `RestaurantService.createTenant()` — mock Firestore; assert document is written at `restaurants/{uid}` with correct `SCHEMA_VERSION`. Test document-exists check returns wizard vs. dashboard.
- [ ] **E2E (T020–T023):** `e2e/user-app/flows/onboarding/` — New owner completes all 3 wizard steps; confirm Firestore write; confirm dashboard redirect. Existing owner log-in skips wizard.

## Dev Notes
- **Files to create/edit:**
  - `projects/user-app/src/app/pages/auth/setup-wizard/setup-wizard.component.ts` + `.html`
  - `projects/user-app/src/app/services/restaurant.service.ts` (create tenant method)
- **Model:** `serializeRestaurant()` / `deserializeRestaurant()` from `@stockpot/shared`. Do NOT define a local `RestaurantDoc` — import exclusively from `@stockpot/shared`.
- **Wireframe & Flow:** [Wireframe_Auth_Setup_Wizard.md](../../context/designs/Wireframe_Auth_Setup_Wizard.md) · [Flow_Auth_Setup_Wizard.md](../../context/designs/Flow_Auth_Setup_Wizard.md)
- **data-test-ids:** `auth-setup-wizard`, `auth-setup-name-input`, `auth-setup-next-btn`, `auth-setup-invite-input`, `auth-setup-finish-btn`
- **CONSTRAINTS:** `mat-stepper` from `MaterialModule` only. Signals for wizard step state. Write uses `serializeRestaurant()` — never write raw objects or `null` fields to Firestore.
