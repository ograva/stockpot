# AUTH-003 — First-Run Restaurant Setup Wizard

| Field | Value |
| :--- | :--- |
| **Module** | AUTH — User-App Authentication & Onboarding |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | user-app |

## User Statement
As a new restaurant owner, I want a guided setup wizard on first login so that my restaurant tenant is created in the system and I can start using StockPot immediately.

## Acceptance Criteria
1. Wizard triggers automatically when authenticated user's `restaurantId` maps to a non-existent Firestore document at `restaurants/{restaurantId}`.
2. Wizard is a multi-step dialog (not a page); user cannot close it without completing all required fields.
3. Step 1 collects: restaurant name (required) and address (required).
4. Step 2 collects: operating currency (default PHP, selectable) and timezone (default Asia/Manila, selectable).
5. On final step completion, Firestore document is created at `restaurants/{restaurantId}` using `serialize()` with `SCHEMA_VERSION`. Write failure shows a retryable error state.
6. After successful creation, wizard closes and the user lands on `/dashboard`.

## data-test-id List
- `auth-setup-wizard` — wizard container
- `auth-setup-step-1` — step 1 container
- `auth-setup-step-2` — step 2 container
- `auth-setup-restaurant-name` — restaurant name input
- `auth-setup-address` — address input
- `auth-setup-currency-select` — currency selector
- `auth-setup-timezone-select` — timezone selector
- `auth-setup-next-button` — next step button
- `auth-setup-finish-button` — final submit button
- `auth-setup-error` — error state container
