# Plan: StockPot SaaS Implementation

**TL;DR**  
Implement **StockPot**, an inventory and recipe management SaaS for SMB restaurants (Philippines market). The **admin app** is for StockPot platform operators; the **user-app** is the product subscribers use, with owner/manager and staff/kitchen roles. Connect raw material tracking, sub-recipe costing, and automated PO generation through a `restaurants/{restaurantId}` multi-tenant Firestore architecture.

---

## App Architecture Split

| App | Port | Audience | Role |
|-----|------|----------|------|
| `projects/admin/` | 4200 | StockPot platform team | Manage tenants, subscriptions, platform analytics |
| `projects/user-app/` | 4400 | Restaurant subscribers | Recipe mgmt, inventory, POs, cost accounting |

---

## Firestore Data Architecture

```
restaurants/{restaurantId}/
  profile           (name, address, subscription tier)
  users/            (owner, manager, staff - RBAC)
  recipes/
  rawMaterials/
  subComponents/
  inventory/
  purchaseOrders/
  vendors/
  costReports/

subscriptions/{subscriptionId}   (platform-level, managed by admin)
payments/{paymentId}             (gateway-agnostic payment records)
```

---

## Implementation Phases

### Phase 1: Project Rebranding & Foundation
1. Rename workspace from `novus-flexy`/`resto-recipe` to `stockpot` in: `package.json`, `.firebaserc`, `angular.json`, emulator seed data, and environment files.
2. Update `.github/copilot-instructions.md` project overview to reflect StockPot.

### Phase 2: Firestore Schema & Security Rules
1. Define `restaurants/{restaurantId}` as root tenant collection.
2. Write `firestore.rules` securing all sub-collections to the restaurant's authenticated users only, with role-based access (owner vs. staff).
3. Create seed data under `firestore.seed.json` with a demo restaurant doc.

### Phase 3: Core Data Models (DAT-302 standard)
Each model file exports `SCHEMA_VERSION` + `Doc` interface + `serialize`/`deserialize`.
1. `Restaurant` model — name, plan tier, timezone, currency.
2. `AppUser` model — uid, restaurantId, role (`owner` | `manager` | `staff`).
3. `Subscription` model — plan, status, billingCycle, paymentGateway placeholder.
4. `PaymentGateway` interface — abstract gateway contract (PayMongo, Maya, GCash adapters scaffolded as stubs, not yet implemented).

### Phase 4: Restaurant Domain Models
1. `Vendor` model — supplier name, contact, lead time.
2. `RawMaterial` model — name, unit, currentStock, parLevel, vendorId, unitCost.
3. `SubComponent` model — name, yield%, ingredients (array of `{rawMaterialId, qty}`), calculatedCostPerUnit.
4. `Recipe` model — name, sellingPrice, portionSize, ingredients (rawMaterials + subComponents), theoreticalCost, actualCost.

### Phase 5: User-App Scaffold (Subscriber Product)
1. Set up role-based routing in `user-app`: owner routes vs. staff routes.
2. `FullLayout` for authenticated users, `BlankLayout` for login/onboarding.
3. Implement `RestaurantService` (signals) — loads current restaurant doc; used across all user-app pages.
4. Implement `AuthService` extension — attach `restaurantId` and `role` to the active user signal.

### Phase 6: Admin App Scaffold (Platform Dashboard)
1. Tenant management page — list all restaurants, view subscription status.
2. Subscription admin — update plan tier, trigger payment events.

### Phase 7: Core Features — Inventory & Procurement
1. Inventory dashboard — list `rawMaterials` with stock levels vs. par levels.
2. Stock deduction signal — when a recipe is "prepared", deduct ingredient quantities from inventory via Angular Signals + Firestore write.
3. PO generation engine — compare `currentStock < parLevel` across all materials, group by vendor, produce a `PurchaseOrder` document.

### Phase 8: Cost Accounting
1. `CostService` — computes `theoreticalCostPerDish` from ingredient quantities × `unitCost`.
2. Track actual vs. theoretical variance reports.
3. Cost report generation (per recipe, per period).

---

## Relevant Files

| File | Change |
|------|--------|
| `package.json` | Rename `name` to `stockpot` |
| `.firebaserc` | Update alias from `novus-flexy` to `stockpot` |
| `angular.json` | Verify project names stay `admin` / `user-app` (no rename needed) |
| `firestore.rules` | Rewrite for `restaurants/{restaurantId}` multi-tenancy |
| `firestore.seed.json` | Seed demo restaurant + users |
| `projects/admin/src/app/` | Platform admin scaffold |
| `projects/user-app/src/app/` | Subscriber app scaffold |
| `environments/` | Update `projectId` across all env files |

---

## Verification Checklist

- [ ] Emulators start and seed data loads under `stockpot` project ID.
- [ ] Firestore rules unit tests: owner can write, staff can only read recipes.
- [ ] Playwright E2E: subscriber login lands on user-app dashboard.
- [ ] Playwright E2E: platform admin login lands on admin tenant list.
- [ ] Unit test: `calculateRecipeCost()` on `CostService` with mock raw material prices.

---

## Decisions

- **Multi-tenancy**: Shared Firestore DB with `restaurants/{restaurantId}` as root — standard B2B SaaS approach (simpler, lower cost).
- **Payment gateway**: Pluggable interface — PayMongo, Maya, GCash adapters scaffolded as stubs; Stripe explicitly excluded (Philippines market).
- **State management**: Angular Signals only for all new state. No RxJS BehaviorSubjects.
- **Admin app**: StockPot platform operator tool (internal use).
- **User-app**: Subscriber product — roles are `owner` | `manager` | `staff` (kitchen read-only).
