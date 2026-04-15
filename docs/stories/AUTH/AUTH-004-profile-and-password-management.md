# AUTH-004 — Profile & Password Management

| Field | Value |
| :--- | :--- |
| **Module** | AUTH — User-App Authentication & Onboarding |
| **Sprint** | 1 |
| **Priority** | Med |
| **App** | user-app |

## User Statement
As any authenticated user, I want to update my display name and change my password so that my account reflects my current identity and remains secure.

## Acceptance Criteria
1. Profile settings are accessible at `/settings/profile` for `owner` and `manager` roles; at `/kitchen/profile` for `staff`.
2. Display name updates write to both the Firebase Auth user profile and `users/{userId}` Firestore document atomically.
3. Password change uses Firebase Auth `updatePassword()`; user must re-authenticate first via `reauthenticateWithCredential()` before the new password is accepted.
4. Success and error states are displayed via a snackbar notification with appropriate `data-test-id` attributes.
5. If re-authentication fails (wrong current password), an inline error is shown without logging the user out.

## data-test-id List
- `auth-profile-display-name` — display name input
- `auth-profile-save-button` — save profile button
- `auth-profile-success-snackbar` — success notification
- `auth-password-current` — current password input
- `auth-password-new` — new password input
- `auth-password-confirm` — confirm new password input
- `auth-password-change-button` — submit password change button
- `auth-password-error` — inline error for wrong current password
