# AUTH-001 — Login with Email & Password

| Field | Value |
| :--- | :--- |
| **Shard ID** | AUTH-001 |
| **Module** | AUTH — User-App Authentication & Onboarding |
| **Story Ref** | AUTH-001 |
| **Priority** | High |
| **Status** | Not Started |
| **Complexity** | S |
| **Depends On** | None |

## Description
Implement the email/password login screen for the user-app (`projects/user-app`). On successful authentication, Firebase Auth state is picked up by `onAuthStateChanged` (registered once in `AppComponent`), which sets the `CoreService` signal. The Angular router then redirects based on resolved user role — `owner`/`manager` → `/dashboard`, `staff` → `/kitchen`.

## Acceptance Criteria
- [ ] Firebase `signInWithEmailAndPassword` is the only auth method used; no custom token exchange.
- [ ] Failed login (wrong credentials, disabled account) renders an inline error beneath the password field without clearing the email input. Error uses `data-test-id="auth-login-error"`.
- [ ] Successful login redirects using `CoreService` role signal — never queries Firebase Auth directly in the component.
- [ ] Session persists across browser refresh via Firebase Auth `setPersistence(LOCAL)`.
- [ ] Login page rendered inside `BlankLayout` wrapper (no sidebar or header).
- [ ] All required `data-test-id` attributes are present (see Dev Notes).

## Test Coverage
- [ ] **Unit:** `AuthService.login()` — mock `signInWithEmailAndPassword`; assert signal update; assert error propagation.
- [ ] **E2E (T000–T002):** `e2e/user-app/flows/authentication/` — Valid credentials redirect to `/dashboard`; invalid credentials show inline error; refresh preserves session.

## Dev Notes

### ⚠️ Pre-Work Required Before Building the Login Component

Watson inspected the codebase on 2026-04-15 and found the following gaps that **must be fixed first**:

**Step 1 — Fix `projects/user-app/src/app/app.component.ts`**
The file is currently an empty shell with only `title = 'Novus App Template'`. The `onAuthStateChanged` listener is **missing entirely**. Copy the pattern from `projects/admin/src/app/app.component.ts` which is already correct:
- Inject `Auth`, `Router`, `CoreService`
- Register `onAuthStateChanged` once in the constructor
- Implement `isFirstEmission` guard (skip first emission — splash screen drives initial nav)
- Redirect logic must be **role-aware**: `staff` → `/kitchen`, `owner`/`manager` → `/dashboard` (admin always goes to `/dashboard/home`, user-app must branch by role)
- Unsubscribe in `ngOnDestroy`

**Step 2 — Fix `projects/user-app/src/app/services/core.service.ts`**
The current `CoreService` drives state via an `authState()` RxJS Observable subscription in its constructor — not through `AppComponent`. This conflicts with the single-listener constraint (CONSTRAINTS.md §4). Make these changes:
- Remove the `authState()` + `takeUntilDestroyed()` subscription from the constructor
- Add a `setCurrentUser(user: User | null): void` method that writes to `_currentUser` (same as admin `CoreService.setCurrentUser()`)
- `AppComponent` becomes the single source of truth for auth state

**Step 3 — Build the login component**

- **Files to create/edit:**
  - `projects/user-app/src/app/pages/auth/login/login.component.ts` + `.html` + `.scss`
  - `projects/user-app/src/app/pages/auth/auth.routes.ts` (add `{ path: 'login', component: LoginComponent }`)
- A working `signInWithEmailAndPassword` login already exists at `projects/user-app/src/app/pages/authentication/side-login/side-login.component.ts` — migrate and clean it up rather than starting from scratch
- **Wireframe:** [Wireframe_Auth_Setup_Wizard.md](../../context/designs/Wireframe_Auth_Setup_Wizard.md) (login precedes wizard)
- **data-test-ids:** `auth-login-form`, `auth-login-email`, `auth-login-password`, `auth-login-submit`, `auth-login-error`
- **CONSTRAINTS:** Standalone component only. Import `MaterialModule` from `projects/user-app/src/app/material.module.ts`. No `BehaviorSubject`. No `getAuth()` direct calls.
