# AUTH-004 — Profile & Password Management

| Field | Value |
| :--- | :--- |
| **Shard ID** | AUTH-004 |
| **Module** | AUTH — User-App Authentication & Onboarding |
| **Story Ref** | AUTH-004 |
| **Priority** | Medium |
| **Status** | Completed |
| **Complexity** | S |
| **Depends On** | AUTH-001 |

## Description
Build a settings page where any authenticated user can update their display name (stored in the `AppUserDoc` at `restaurants/{rId}/users/{uid}`) and change their Firebase Auth password via `updatePassword()`. After a password change, the user is prompted to re-authenticate first to satisfy Firebase's recent-login requirement.

## Acceptance Criteria
- [ ] Display name update saves to `AppUserDoc` using `serializeAppUser()` from `@stockpot/shared`.
- [ ] Password change calls `reauthenticateWithCredential()` before `updatePassword()`.
- [ ] Success states display a toast notification.
- [ ] Component reads current display name from `CoreService` signal — no direct Firestore read at component level.
- [ ] Page accessible to all roles (`owner`, `manager`, `staff`) at `/settings/profile`.

## Test Coverage
- [ ] **Unit:** `ProfileService.updateDisplayName()` — mock Firestore write; assert `serializeAppUser()` is called. `ProfileService.changePassword()` — mock re-auth; assert `updatePassword()` called on success.
- [ ] **E2E (T030):** `e2e/user-app/flows/profile/` — Update display name; confirm signal update and toast.

## Dev Notes
- **Files to create/edit:**
  - `projects/user-app/src/app/pages/auth/profile/profile.component.ts` + `.html`
- **Model:** `AppUserDoc` → import `serializeAppUser`, `deserializeAppUser` from `@stockpot/shared`.
- **CONSTRAINTS:** Re-authentication is required before password change — this is a Firebase security requirement, not optional.
