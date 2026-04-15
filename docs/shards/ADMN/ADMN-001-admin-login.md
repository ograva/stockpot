# ADMN-001 — Admin App Login

| Field | Value |
| :--- | :--- |
| **Shard ID** | ADMN-001 |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Story Ref** | ADMN-001 |
| **Priority** | High |
| **Status** | Not Started |
| **Complexity** | S |
| **Depends On** | None |

## Description
Implement the login screen for the standalone `projects/admin` Angular application. This is a separate application from the user-app with its own Firebase Auth integration. Only users with the `platform_admin` custom Firebase Auth claim can reach the admin dashboard. Auth state flows through the admin app's own `AdminCoreService` signal.

## Acceptance Criteria
- [ ] Admin login renders inside `BlankComponent` layout (no sidebar/nav).
- [ ] `signInWithEmailAndPassword` used; no SSO or magic link.
- [ ] Post-login, Cloud Function or Firestore rule validates `platform_admin` custom claim. Non-admin users are redirected to `/unauthorized`.
- [ ] `onAuthStateChanged` registered once in admin `AppComponent`, writes to `AdminCoreService` signal.
- [ ] Login form deactivation: if no `platform_admin` claim, show "Access Denied" message and sign out the user.

## Test Coverage
- [ ] **Unit:** `AdminAuthService.login()` — mock success/failure; assert signal update.
- [ ] **E2E (T100–T101):** `e2e/admin/flows/authentication/` — Valid admin credentials reach dashboard; non-admin credentials see "Access Denied".

## Dev Notes
- **Files to create/edit:**
  - `projects/admin/src/app/pages/auth/login/login.component.ts` + `.html`
  - `projects/admin/src/app/services/admin-core.service.ts` (signal: `currentAdminUser`)
- **Custom Claim Check:** After `onAuthStateChanged`, call `getIdTokenResult(true)` and verify `claims.platform_admin === true`. If not, `signOut()` and show error.
- **CONSTRAINTS:** Standalone component. Import `MaterialModule` from admin's `material.module.ts`. Signals only — no `BehaviorSubject`.
