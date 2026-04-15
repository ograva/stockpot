# ADMN-010 — Operator Profile Management

| Field | Value |
| :--- | :--- |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Sprint** | 1 |
| **Priority** | Low |
| **App** | admin |

## User Statement
As a platform operator, I want to manage my admin profile and update my credentials so that my account remains secure and accurate.

## Acceptance Criteria
1. Profile settings accessible at `/admin/settings/profile`.
2. Operator can update their display name; change writes to both Firebase Auth profile and the platform operator Firestore record.
3. Password change uses Firebase Auth `updatePassword()` with mandatory re-authentication (`reauthenticateWithCredential()`) before the new password is accepted.
4. Operators cannot remove their own `platform_admin` custom claim from within the app (claim management is done via Firebase Admin SDK externally).
5. Success and error states displayed via snackbar with appropriate `data-test-id` attributes.

## data-test-id List
- `admn-profile-display-name` — display name input
- `admn-profile-save-button` — save button
- `admn-profile-success-snackbar` — success notification
- `admn-password-current` — current password input
- `admn-password-new` — new password input
- `admn-password-change-button` — submit password change
