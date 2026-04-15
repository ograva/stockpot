# ADMN-001 — Admin App Login

| Field | Value |
| :--- | :--- |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | admin |

## User Statement
As a StockPot platform operator, I want to log in to the Admin app with my admin credentials so that I can manage the platform independently of any restaurant account.

## Acceptance Criteria
1. Admin app uses Firebase Auth; platform operators are distinguished by a `platform_admin` custom claim on their Firebase Auth token.
2. Users without the `platform_admin` claim who attempt to access admin routes are rejected at the Firestore Security Rule level — not just at the route guard.
3. Login in the admin app is a fully separate login page from the user-app (different Angular app, different route).
4. Failed login displays an inline error with no information distinguishing between "wrong password" and "not an admin" (security best practice).
5. Successful login routes to `/admin/dashboard`.

## data-test-id List
- `admn-login-email` — email input
- `admn-login-password` — password input
- `admn-login-submit` — submit button
- `admn-login-error` — inline error message
