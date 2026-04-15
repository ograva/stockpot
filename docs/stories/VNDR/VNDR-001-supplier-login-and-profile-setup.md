# VNDR-001 — Supplier Login & Profile Setup

| Field | Value |
| :--- | :--- |
| **Module** | VNDR — Vendor / Supplier Portal |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | vendor-app (new Angular app — `projects/vendor-app`) |
| **⚠️ Watson Architecture Dependency** | `projects/vendor-app` does not yet exist. Watson must scaffold this Angular 21 app and add it to `angular.json` before Sprint 2. See PRD §8, Open Question #2. |
| **Depends On** | ADMN-007 (admin must have created the supplier record and sent an invite) |

## User Statement
As a supplier representative, I want to log in to the Vendor Portal and complete my supplier profile so that restaurant clients on the platform can find my business and know what I supply.

## Acceptance Criteria
1. Vendor Portal Firebase Auth login; supplier user linked to `vendors/{vendorId}` Firestore document via Firebase Auth custom claim (`vendorId`).
2. First login (after admin invite acceptance) triggers a profile completion wizard before accessing any other feature.
3. Profile wizard collects: contact name, business phone, and service region (required); website and business description (optional).
4. Profile saves to `vendors/{vendorId}` using `serialize()` with `SCHEMA_VERSION`.
5. After profile completion, supplier lands on their catalog management dashboard.

## data-test-id List
- `vndr-login-email` — email input
- `vndr-login-submit` — submit button
- `vndr-login-error` — error message
- `vndr-profile-wizard` — profile completion wizard container
- `vndr-profile-contact-name` — contact name input
- `vndr-profile-phone` — phone input
- `vndr-profile-region` — service region input
- `vndr-profile-save-button` — save profile button
- `vndr-profile-form` — profile form container
