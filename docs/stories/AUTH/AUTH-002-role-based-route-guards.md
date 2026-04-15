# AUTH-002 — Role-Based Route Guards

| Field | Value |
| :--- | :--- |
| **Module** | AUTH — User-App Authentication & Onboarding |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | user-app |

## User Statement
As a platform architect, I want route guards to enforce role-based access so that kitchen staff cannot reach owner-only configuration pages.

## Acceptance Criteria
1. `owner` role can access all user-app routes without restriction.
2. `manager` role is blocked from `/settings/*` and `/reconciliation/*` routes, redirected to `/unauthorized`.
3. `staff` role is restricted to `/kitchen/*` routes only; any other route redirects to `/unauthorized`.
4. Unauthenticated users attempting to access any protected route are redirected to `/login`.
5. Route guard reads role exclusively from the `CoreService` signal — no additional Firebase Auth calls in guards.
6. Guard logic is implemented as an Angular functional guard (`canActivate`), not a class-based guard.

## data-test-id List
- `auth-unauthorized-message` — message shown on the /unauthorized page
- `auth-unauthorized-back-button` — button to navigate back to the appropriate home screen
