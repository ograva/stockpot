# ADMN-007 — Supplier Network Management

| Field | Value |
| :--- | :--- |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | admin |
| **Downstream Dependency** | MSTR-004 (restaurants link raw materials to suppliers), VNDR-001 (vendor portal access is tied to vendor record) |

## User Statement
As a platform operator, I want to manage a curated directory of local suppliers so that restaurants can connect to verified vendors with live product catalogs and always-current pricing.

## Acceptance Criteria
1. Suppliers stored at `vendors/{vendorId}` in Firestore with `isPlatformManaged: true` flag. Platform-managed suppliers are distinct from restaurant-created custom suppliers which have `isPlatformManaged: false`.
2. Admin can create a new supplier: collects business name, contact name, phone, email (used to invite to Vendor Portal via Firebase Auth), and service region.
3. Admin can edit supplier details and deactivate a supplier; deactivated suppliers are hidden from restaurant vendor search but remain on existing POs and their historical price data is preserved.
4. Admin can view all suppliers with a filter for Active / Deactivated / Pending Onboarding (Vendor Portal invite sent but not yet accepted).
5. Inviting a supplier sends a Vendor Portal invitation email via Firebase Auth `sendSignInLinkToEmail`.

## data-test-id List
- `admn-supplier-list-table` — supplier directory table
- `admn-supplier-add-button` — add new supplier button
- `admn-supplier-status-filter` — status filter
- `admn-supplier-row-{vendorId}` — per-row identifier
- `admn-supplier-invite-button-{vendorId}` — send Vendor Portal invite
- `admn-supplier-deactivate-button-{vendorId}` — deactivate supplier
