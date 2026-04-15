# ADMN-010 — Operator Profile Management

| Field | Value |
| :--- | :--- |
| **Shard ID** | ADMN-010 |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Story Ref** | ADMN-010 |
| **Priority** | Low |
| **Status** | Completed |
| **Complexity** | XS |
| **Depends On** | ADMN-001 |

## Description
Simple profile management page in the admin app allowing the platform operator to update their display name and change their Firebase Auth password. Mirrors AUTH-004 but scoped to the admin application context and `PlatformAdminUserDoc` model.

## Acceptance Criteria
- [ ] Display name update writes to `PlatformAdminUserDoc` using `serializePlatformAdminUser()` from `@stockpot/shared`.
- [ ] Password change calls `reauthenticateWithCredential()` before `updatePassword()`.
- [ ] Success toast is shown after each update.
- [ ] Admin profile page accessible at `/profile` within the admin app.

## Test Coverage
- [ ] **Unit:** `AdminProfileService.updateDisplayName()` — mock Firestore partial update; assert correct path `platform_admins/{uid}`.

## Dev Notes
- **Files to create/edit:** `projects/admin/src/app/pages/profile/profile.component.ts` + `.html`
- **Model:** `PlatformAdminUserDoc` — import from `@stockpot/shared`.
- **Note:** This is a low-priority XS shard — implement last in the ADMN sprint to avoid blocking higher priority work.
