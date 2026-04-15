# ADMN-003 — Subscription Tier Assignment

| Field | Value |
| :--- | :--- |
| **Shard ID** | ADMN-003 |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Story Ref** | ADMN-003 |
| **Priority** | High |
| **Status** | Not Started |
| **Complexity** | S |
| **Depends On** | ADMN-002 |

## Description
Add subscription tier management to the tenant detail view. A platform operator can assign or change a restaurant's subscription tier (`FREE`, `STARTER`, `PROFESSIONAL`). The tier is stored on the `RestaurantDoc.subscriptionTier` field and controls which features are gated in the user-app. Tier changes are applied immediately via a Firestore partial update; a `SubscriptionDoc` at `restaurants/{rId}/subscription/current` tracks billing history.

## Acceptance Criteria
- [ ] Subscription tier selector visible on the Tenant edit dialog or a dedicated "Subscription" tab.
- [ ] Available tiers: `FREE`, `STARTER`, `PROFESSIONAL` — rendered as a `mat-select`.
- [ ] On save, writes `subscriptionTier` field to `RestaurantDoc` via `serializeRestaurant()` partial update.
- [ ] Tier change writes a `SubscriptionDoc` history entry at `restaurants/{rId}/subscription/{timestamp}` using `serializeSubscription()`.
- [ ] UI clearly labels the current active tier with a badge.

## Test Coverage
- [ ] **Unit:** `TenantService.setSubscriptionTier()` — mock Firestore; assert partial update to `RestaurantDoc` and new `SubscriptionDoc` written at correct path.
- [ ] **E2E (T114):** Select `PROFESSIONAL` for a tenant; confirm badge updates and `SubscriptionDoc` exists in Firestore.

## Dev Notes
- **Files to create/edit:** Extend `projects/admin/src/app/services/tenant.service.ts`. Update tenant edit dialog HTML.
- **Models:** `SubscriptionDoc` — import `serializeSubscription`, `deserializeSubscription` from `@stockpot/shared`.
- **CONSTRAINTS:** Optional `notes` field uses conditional spread: `...(notes ? { notes } : {})`. Never write `null`.
