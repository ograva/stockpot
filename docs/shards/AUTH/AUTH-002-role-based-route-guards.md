# AUTH-002 — Role-Based Route Guards

| Field | Value |
| :--- | :--- |
| **Shard ID** | AUTH-002 |
| **Module** | AUTH — User-App Authentication & Onboarding |
| **Story Ref** | AUTH-002 |
| **Priority** | High |
| **Status** | Completed |
| **Complexity** | S |
| **Depends On** | AUTH-001 |

## Description
Implement two Angular functional guards: `authGuard` (blocks unauthenticated access to any protected route) and `roleGuard` (enforces role-based restrictions — `owner` can access all routes, `manager` is blocked from `/settings/master-data`, `staff` is restricted to `/kitchen/*`). All guards read exclusively from the `CoreService` signal; they never call `getAuth()` directly.

## Acceptance Criteria
- [ ] `authGuard` redirects unauthenticated users to `/auth/login`.
- [ ] `roleGuard` blocks `manager` from `/settings/master-data/**` routes; redirects to `/unauthorized`.
- [ ] `roleGuard` blocks `staff` from all routes except `/kitchen/**`; redirects to `/unauthorized`.
- [ ] `/unauthorized` page renders with `data-test-id="auth-unauthorized-message"`.
- [ ] Guards implemented as Angular functional guards (`CanActivateFn`) — no class-based guards.
- [ ] Guards read role from `CoreService` signal, not from Firebase Auth or Firestore directly.

## Test Coverage
- [ ] **Unit:** `authGuard` — mock `CoreService` returning null vs. valid user; assert `UrlTree` redirect vs. `true`. `roleGuard` — mock three role values; assert correct allow/deny/redirect outcomes.
- [ ] **E2E (T010–T013):** `e2e/user-app/flows/authentication/` — Navigate to `/settings/master-data` as `staff`; confirm redirect to `/unauthorized`. Navigate to `/kitchen` as `owner`; confirm access granted.

## Dev Notes
- **Files to create/edit:**
  - `projects/user-app/src/app/guards/auth.guard.ts`
  - `projects/user-app/src/app/guards/role.guard.ts`
  - `projects/user-app/src/app/pages/auth/unauthorized/unauthorized.component.ts`
- **`app.routes.ts`**: Apply `[authGuard]` to the `FullLayout` parent route, role-specific guards on protected nested routes.
- **CONSTRAINTS:** No `BehaviorSubject` for role state. Guards must be functional (`inject(CoreService)`), not class-based.
