# AUTH-001 — Login with Email & Password

| Field | Value |
| :--- | :--- |
| **Module** | AUTH — User-App Authentication & Onboarding |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | user-app |

## User Statement
As a restaurant user, I want to log in with my email and password so that I can access my restaurant's StockPot dashboard securely.

## Acceptance Criteria
1. Firebase Auth `signInWithEmailAndPassword` is used; no custom auth backend or token exchange required.
2. Failed login (wrong credentials, unverified email, account disabled) displays an inline error message beneath the password field without clearing the email field.
3. Successful login reads the user's role from the `CoreService` signal and redirects to `/dashboard` (owner/manager) or `/kitchen` (staff).
4. Session persists across browser refresh and app reopening via Firebase Auth `setPersistence(LOCAL)`.
5. Login is throttled by Firebase Auth's built-in brute-force protection; no custom rate limiting needed.

## data-test-id List
- `auth-login-email` — email input field
- `auth-login-password` — password input field
- `auth-login-submit` — submit button
- `auth-login-error` — inline error message container
- `auth-login-form` — form container
