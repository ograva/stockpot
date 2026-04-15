# ADMN-003 — Subscription Tier Assignment

| Field | Value |
| :--- | :--- |
| **Module** | ADMN — Admin App (Platform Operator) |
| **Sprint** | 1 |
| **Priority** | High |
| **App** | admin |

## User Statement
As a platform operator, I want to assign and change a restaurant's subscription tier so that feature access is correctly gated per plan.

## Acceptance Criteria
1. Subscription tiers are defined at `platform/config/subscriptionTiers` in Firestore; admin can view the tier list from the tenant detail page.
2. Admin can change a tenant's tier from a dropdown; change takes effect immediately upon save.
3. The tenant's `subscriptionTier` field in Firestore is what the user-app reads to gate feature access — not a client-side check.
4. Downgrading a tier that removes access to features currently in use shows a warning (e.g., "This tenant has active vendor portal connections that will be disabled.").
5. Tier change is logged to `platform/auditLog` with: operator UID, tenant ID, old tier, new tier, and timestamp.

## data-test-id List
- `admn-subscription-tier-select` — tier selector dropdown
- `admn-subscription-save-button` — save tier change button
- `admn-subscription-downgrade-warning` — warning message for downgrade impacts
