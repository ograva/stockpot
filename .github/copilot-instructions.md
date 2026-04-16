# StockPot — AI Coding Guidelines

> **Living context:** Deep project documentation lives in `docs/context/`. Read those files before making architectural decisions.
> **NEVER** read from `docs/base_template/` — it contains blank starter templates, not project state.

---

## 1. Project Overview

**StockPot** is a three-sided SaaS platform built by **Novus Apps** for SMB restaurants in the Philippines. It digitizes a 30-year-old expert Excel model into a closed-loop system that couples purchasing, receiving, preparation, and sales reconciliation — eliminating the operational guesswork that costs restaurant owners food-cost margin.

| Field               | Details                                                                     |
| :------------------ | :-------------------------------------------------------------------------- |
| **Owner**           | Novus Apps                                                                  |
| **Stack**           | Angular 21 + Firebase + Material 21 + Tailwind 4                            |
| **Architecture**    | Angular monorepo (`angular.json`) + single Firebase project                 |
| **Admin App**       | `projects/admin` — port 4200 — Platform operator dashboard                  |
| **User-App**        | `projects/user-app` — port 4400 — Restaurant operations PWA (offline-first) |
| **Vendor Portal**   | `projects/vendor-app` — port 4600 — Supplier self-service catalog (new)     |
| **Hardware Bridge** | `local-bridge/` — port 3500 — Node.js Express server (on-premise, new)      |
| **Shared Library**  | `projects/shared` — importable as `@stockpot/shared`                        |
| **Backend**         | Firebase Auth, Firestore, Cloud Functions (Node.js 22), Storage, FCM        |
| **E2E Testing**     | Playwright + Chromium                                                       |
| **Unit Testing**    | Jasmine + Karma                                                             |

> For complete context see: `docs/context/PRD.md`, `docs/context/Architecture.md`, `docs/context/CONSTRAINTS.md`, `docs/context/ProjectBrief.md`.

---

## 2. Workspace Structure

```
stockpot/
├── projects/
│   ├── admin/                    # Port 4200 — Platform operator dashboard
│   │   └── src/app/
│   │       ├── layouts/          #   FullComponent + BlankComponent layouts
│   │       ├── pages/            #   auth/, tenants/, catalog/, dashboard/
│   │       ├── services/         #   AdminCoreService, TenantService, PlatformCatalogService
│   │       ├── material.module.ts
│   │       ├── app.config.ts
│   │       └── app.routes.ts
│   │
│   ├── user-app/                 # Port 4400 — Restaurant subscriber PWA (offline-first)
│   │   └── src/app/
│   │       ├── layouts/          #   FullLayout (auth), BlankLayout (login)
│   │       ├── pages/            #   auth/, master-data/, replenishment/, kitchen/,
│   │       │                     #   reconciliation/, alerts/
│   │       ├── services/         #   CoreService, StoreForwardService, HardwareBridgeService
│   │       ├── guards/           #   auth.guard.ts, role.guard.ts
│   │       ├── material.module.ts
│   │       ├── app.config.ts
│   │       └── app.routes.ts
│   │
│   ├── vendor-app/               # Port 4600 — Supplier Portal (new)
│   │   └── src/app/
│   │       ├── pages/            #   login/, catalog/, orders/
│   │       ├── services/         #   VendorCoreService, VendorCatalogService
│   │       ├── material.module.ts
│   │       ├── app.config.ts
│   │       └── app.routes.ts
│   │
│   └── shared/                   # Angular library — @stockpot/shared
│       └── src/
│           ├── index.ts          #   Barrel export (public API)
│           └── models/           #   ALL Firestore Doc interfaces (DAT-302)
│               ├── restaurant.model.ts           # v2 — adds status field
│               ├── app-user.model.ts             # v1 — owner/manager/staff roles
│               ├── raw-material.model.ts         # v2 — adds parMinimum, criticalThreshold
│               ├── recipe.model.ts               # v2 — adds parPortions
│               ├── vendor.model.ts               # v2 — RestaurantSupplierDoc (renamed)
│               ├── sub-component.model.ts
│               ├── subscription.model.ts
│               ├── purchase-order.model.ts       # new
│               ├── platform-vendor.model.ts      # new
│               ├── vendor-catalog-item.model.ts  # new
│               ├── platform-uom.model.ts         # new
│               ├── platform-ingredient.model.ts  # new
│               ├── reconciliation.model.ts       # new
│               ├── alert-config.model.ts         # new
│               ├── platform-admin-user.model.ts  # new
│               └── notification.model.ts         # new
│
├── local-bridge/                 # Port 3500 — Node.js 22 Express hardware bridge (new)
│   ├── package.json              #   @stockpot/local-bridge, type: "module"
│   ├── tsconfig.json             #   ESM / NodeNext
│   └── src/
│       ├── index.ts              #   Express entry — PORT env, ALLOWED_ORIGIN CORS
│       ├── routes/               #   health.route.ts, scale.route.ts, printer.route.ts
│       └── adapters/             #   scale.adapter.ts (serialport), printer.adapter.ts (ESC/POS)
│
├── functions/                    # Firebase Cloud Functions (Node.js 22)
│   └── src/
│       ├── index.ts              #   Function registrations
│       ├── handlers/             #   back-calculation, deduction, alert, price-propagation
│       └── models/               #   Minimal server-side Doc interfaces (no serialize/deserialize)
│
├── environments/                 # Shared Firebase config: local, staging, prod
├── e2e/                          # Playwright E2E tests (admin/ and user-app/ flows)
├── emulator-data/                # Firebase emulator snapshot for local dev
├── docs/
│   ├── context/                  # ✅ LIVING DOCS — always read these
│   │   ├── PRD.md                #   Feature modules, user stories, NFRs
│   │   ├── Architecture.md       #   Tech stack, data models, system diagrams
│   │   ├── CONSTRAINTS.md        #   Golden rules — cannot be violated
│   │   └── DECISION_LOG.md       #   ADL entries for all architectural decisions
│   ├── base_template/            # ❌ BLANK TEMPLATES — DO NOT read as project reference
│   ├── stories/                  #   54 user story files (10 module folders)
│   └── testing/                  #   Test strategy and registry
├── angular.json                  # Project registry (admin, user-app, vendor-app, shared)
├── tsconfig.json                 # @stockpot/shared path alias defined here
└── firestore.rules               # Multi-tenant security rules
```

### Path Alias

All Angular apps import shared models via:

```typescript
import { RestaurantDoc, deserializeRestaurant } from "@stockpot/shared";
```

Resolves to `projects/shared/src/index.ts` via `paths` in root `tsconfig.json`. **Never duplicate model definitions inside individual app `src/` folders.**

---

## 3. Product Modules

The 10 module prefix codes below are canonical — they drive story files, component names, test IDs, and Cloud Function names. Do not invent new prefix codes.

| Prefix | Module Name                          | App           | Sprint | One-Line Description                                                                   |
| :----- | :----------------------------------- | :------------ | :----- | :------------------------------------------------------------------------------------- |
| `AUTH` | User-App Authentication & Onboarding | user-app      | 1      | Login, role-based guards, first-run restaurant setup wizard                            |
| `ADMN` | Admin App (Platform Operator)        | admin         | 1      | Tenant management, subscriptions, platform catalog (UoMs, ingredients, suppliers)      |
| `MSTR` | Restaurant Master Data Setup         | user-app      | 1      | Raw materials, sub-components, recipes, par levels, back-calculation engine            |
| `REPO` | Smart PO & Replenishment Engine      | user-app      | 2      | Shortfall dashboard, auto-PO generation, PO approval and history                       |
| `KTCH` | Kitchen Execution Hub                | user-app      | 2      | Touch-first receiving, prep batching, stock adjustments — tablet-optimised             |
| `SYNC` | Offline Sync & Receiving             | user-app      | 2      | StoreForwardService queue, offline banner, reconnect drain                             |
| `HWBR` | Local Hardware Bridge                | local-bridge  | 2      | Node.js Express proxying weighing scales and thermal printers                          |
| `VNDR` | Vendor / Supplier Portal             | vendor-app    | 2      | Supplier catalog self-management, price updates, incoming PO view                      |
| `RCNC` | Reconciliation & Variance Auditing   | user-app      | 3      | CSV POS upload, theoretical deduction run, expected vs. actual count sheet             |
| `ALRT` | Alert Engine                         | user-app + CF | 3      | Stockout and over-budget alerts via Firestore triggers, FCM push, in-app notifications |

### User Roles

| Role             | App        | Access Level                                                                   |
| :--------------- | :--------- | :----------------------------------------------------------------------------- |
| `owner`          | user-app   | Full access — configuration, approvals, reconciliation, alerts                 |
| `manager`        | user-app   | Kitchen, PO management, stock adj. Cannot access master data or reconciliation |
| `staff`          | user-app   | `/kitchen/*` routes only. Read-only stock views                                |
| `platform_admin` | admin      | Custom Firebase Auth claim. All platform catalog writes                        |
| `vendorId` claim | vendor-app | Custom Firebase Auth claim. Scoped to `vendors/{vendorId}` collection          |

---

## 4. Architecture Conventions

### State Management — Angular Signals Only

Use Angular 21 **Signals** for all reactive state. Do not use `BehaviorSubject`, `Subject`, or similar manually managed RxJS patterns for shared state.

```typescript
// ✅ CORRECT — CoreService pattern
private _user = signal<AppUser | null>(null);
getUser() { return this._user(); }
refreshCurrentUser(user: AppUser | null) {
  this._user.set(null);          // break object reference
  this._user.set(user);          // force Signal re-evaluation
}

// ❌ INCORRECT
private userSubject = new BehaviorSubject<AppUser | null>(null);
```

### Data Layer — DAT-302 Pattern

Every Firestore document model **must** follow the three-export pattern. All models live in `projects/shared/src/models/` and are imported via `@stockpot/shared`.

```typescript
// Example: projects/shared/src/models/purchase-order.model.ts

export const PURCHASE_ORDER_SCHEMA_VERSION = 1;

export interface PurchaseOrderDoc {
  _schemaVersion: number;
  status: PurchaseOrderStatus;
  supplierId: string;
  lineItems: PurchaseOrderLineItem[];
  // ... other fields
}

export type PurchaseOrder = Omit<PurchaseOrderDoc, "_schemaVersion">;

export function deserializePurchaseOrder(raw: unknown): PurchaseOrder {
  const data = (raw ?? {}) as Partial<PurchaseOrderDoc>;
  // migration gate here
  return { status: data.status ?? "DRAFT" /* ... */ };
}

export function serializePurchaseOrder(po: PurchaseOrder): PurchaseOrderDoc {
  return {
    _schemaVersion: PURCHASE_ORDER_SCHEMA_VERSION,
    status: po.status,
    // optional fields: ...(po.notes ? { notes: po.notes } : {})
  };
}
```

**Rules:**

- `serialize()`: omit empty optionals — **never write `null` to Firestore**
- `deserialize()`: handle schema migration and fill defaults
- `_schemaVersion` is always written; never stripped
- Optional fields use conditional spread: `...(value ? { field: value } : {})`

### Auth — onAuthStateChanged Once Only

Firebase Auth state is registered **once** in `AppComponent` via `onAuthStateChanged`. All other layers (services, guards, components) read the **`CoreService` signal** — they never call `getAuth()` directly.

### Component Pattern — Standalone Only

```typescript
@Component({
  selector: "app-example",
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: "./example.component.html",
  styleUrls: ["./example.component.scss"],
})
export class ExampleComponent {}
```

- Always include `imports` array (no NgModule declarations)
- Selector prefix: `app-`
- Import `MaterialModule` — never import individual Material modules directly
- `ViewEncapsulation.None` only for global Material theme customisations

### Routing — Lazy Loading

```typescript
{
  path: 'replenishment',
  loadChildren: () => import('./pages/replenishment/replenishment.routes')
    .then((m) => m.ReplenishmentRoutes)
}
```

All routes are nested under `FullLayout` or `BlankLayout`. Route files are named `*.routes.ts`.

### Styling — Material 21 + Tailwind 4

- **Material 21** for complex behaviors: forms, dialogs, tables, navigation
- **Tailwind 4** for layout and spacing
- SCSS architecture in `src/assets/scss/`
- Material theme via `@use '@angular/material' as mat;`

### Kitchen UX Rules (KTCH + SYNC modules)

- Minimum **44px tap targets** on all interactive elements
- **Dialog-driven** workflows only — never dense table-based entry
- **No keyboard entry** as primary mechanism — use +/– controls
- All writes pass through `StoreForwardService` when in offline mode

---

## 5. Development Commands

```bash
# ─── Full development environment ─────────────────────────────────────────────
npm run dev                  # All apps + Firebase emulators (recommended)

# ─── Individual processes ──────────────────────────────────────────────────────
npm run start                # Admin app only    → http://localhost:4200
npm run start:user           # User-App only     → http://localhost:4400
npm run start:vendor         # Vendor Portal     → http://localhost:4600
npm run start:bridge         # Hardware bridge   → http://localhost:3500
npm run start:all            # All 3 Angular apps (no emulators)
npm run firebase:emulators   # Firebase emulators only → http://localhost:8080

# ─── Build ────────────────────────────────────────────────────────────────────
npm run build                # Production build — all apps
npm run build:admin          # Admin only
npm run build:user           # User-App only
npm run build:vendor         # Vendor Portal only

# ─── Testing ──────────────────────────────────────────────────────────────────
npm test                     # Karma + Jasmine unit tests
npm run test:e2e:admin       # Playwright E2E — Admin app (requires all 3 processes running)
npm run test:e2e:user        # Playwright E2E — User-App
npm run test:e2e             # Both E2E suites

# ─── Firebase utilities ────────────────────────────────────────────────────────
npm run firebase:emulators:export   # Save emulator state to emulator-data/
npm run firebase:deploy             # Deploy to Firebase Hosting (production)
```

### Port Reference

| Port | Service                         | Used By                              |
| :--- | :------------------------------ | :----------------------------------- |
| 4200 | Admin Angular app               | Browser, Playwright admin E2E        |
| 4400 | User-App Angular PWA            | Browser, Playwright user E2E         |
| 4600 | Vendor Portal Angular app       | Browser                              |
| 3500 | Local Hardware Bridge (Express) | User-App browser (same machine only) |
| 8080 | Firebase Emulator UI            | Browser                              |
| 8085 | Firestore Emulator              | All Angular apps                     |
| 9098 | Auth Emulator                   | All Angular apps                     |
| 5001 | Functions Emulator              | All Angular apps                     |
| 9199 | Storage Emulator                | All Angular apps                     |

> **Emulators first!** Always start `npm run firebase:emulators` before the Angular apps, or use `npm run dev`. Angular apps call `connectAuthEmulator()` and `connectFirestoreEmulator()` at bootstrap — missing emulators cause silent CORS failures.

---

## 6. Key Files Reference

| File                                             | Purpose                                                                             |
| :----------------------------------------------- | :---------------------------------------------------------------------------------- |
| `projects/admin/src/app/app.config.ts`           | Admin app providers — Firebase, router, Material                                    |
| `projects/admin/src/app/app.routes.ts`           | Admin route tree (lazy-loaded pages)                                                |
| `projects/admin/src/app/material.module.ts`      | Admin Material module — all Material re-exports                                     |
| `projects/user-app/src/app/app.config.ts`        | User-App providers — Firebase with emulator toggle, StoreForward, i18n              |
| `projects/user-app/src/app/app.routes.ts`        | User-App route tree with role guards                                                |
| `projects/user-app/src/app/material.module.ts`   | User-App Material module                                                            |
| `projects/vendor-app/src/app/app.config.ts`      | Vendor Portal providers — Firebase Auth (magic link)                                |
| `projects/vendor-app/src/app/app.routes.ts`      | Vendor Portal routes: login, catalog, orders                                        |
| `projects/vendor-app/src/app/material.module.ts` | Vendor Portal Material module                                                       |
| `projects/shared/src/index.ts`                   | `@stockpot/shared` barrel export — all model imports start here                     |
| `projects/shared/src/models/`                    | All DAT-302 Firestore model files                                                   |
| `environments/environment.local.ts`              | Local Firebase config — always used during dev                                      |
| `functions/src/index.ts`                         | Cloud Function registrations                                                        |
| `local-bridge/src/index.ts`                      | Hardware bridge Express server entry point                                          |
| `tsconfig.json` (root)                           | `@stockpot/shared` path alias defined here                                          |
| `angular.json`                                   | All four project definitions (admin, user-app, vendor-app, shared)                  |
| `firestore.rules`                                | Multi-tenant security rules — `restaurants/{rId}`, `vendors/{vId}`, platform claims |
| `docs/context/PRD.md`                            | Feature modules, user stories, acceptance criteria (54 stories)                     |
| `docs/context/Architecture.md`                   | Tech stack, data models, API design, system diagrams                                |
| `docs/context/CONSTRAINTS.md`                    | Golden Rules — all code must comply                                                 |
| `docs/context/DECISION_LOG.md`                   | ADL-001 → ADL-009 — architectural decision history                                  |

---

## 7. Common Pitfalls

- **Don't** import individual Material modules — always use `MaterialModule` from the local app's `material.module.ts`
- **Don't** use `BehaviorSubject` or `Subject` for new shared state — use Angular Signals
- **Don't** create NgModules — use the standalone component pattern exclusively
- **Don't** write `null` to Firestore — use conditional spread for optional fields
- **Don't** duplicate model interfaces in app `src/` folders — import exclusively from `@stockpot/shared`
- **Don't** call `getAuth()` in services, guards, or components — read `CoreService` signal only
- **Don't** hardcode the local-bridge URL — it is user-configurable via HWBR-004 settings; read from `HardwareBridgeService`
- **Don't** implement REPO-002 Auto-PO as a Cloud Function — it is client-side computation by design (ADL-004)
- **Don't** read from `docs/base_template/` — it contains blank starter templates, not this project's actual state
- **Verify** the `vendors/` collection path: top-level `vendors/{vendorId}` = `PlatformVendorDoc`; restaurant-scoped = `restaurants/{rId}/suppliers/{supplierId}` = `RestaurantSupplierDoc` (renamed in v2, ADL-003)
- **Verify** ADMN-005/ADMN-006 use flat Firestore paths `platform_uom/{id}` and `platform_ingredients/{id}` — not the nested `platform/catalog/uom/` path referenced in the PRD ACs (ADL-002)
- **Verify** conflict resolution for SYNC-003: last-write-wins + conflict logged to `syncConflicts/` subcollection — no manual review queue in v1 (ADL-005)

---

## 8. Testing Philosophy — Build with Testing in Mind

Every feature is designed for testability. Test IDs are added at component creation time, not retroactively.

### Testing Strategy

| Layer                | Tool                     | Scope                                                                             |
| :------------------- | :----------------------- | :-------------------------------------------------------------------------------- |
| Unit Tests           | Jasmine + Karma          | Component logic, model serialize/deserialize transforms, CostService calculations |
| E2E Tests            | Playwright + Chromium    | Full user flows — admin and user-app grouped separately                           |
| Test Data Attributes | `data-test-id`           | Every interactive element; required for all Playwright selectors                  |
| Environment Safety   | `playwright.config.*.ts` | E2E runs only on emulators and staging — never production                         |

### `data-test-id` Convention

**ALWAYS add `data-test-id` attributes to HTML elements for Playwright targeting:**

```html
<!-- ✅ CORRECT -->
<button data-test-id="repo-generate-po-button" (click)="generatePo()">Generate PO</button>
<input data-test-id="auth-login-email" type="email" [(ngModel)]="email" />
<div data-test-id="ktch-receiving-confirm-button" class="card">...</div>
<mat-select data-test-id="mstr-uom-selector" [(value)]="selectedUom">...</mat-select>

<!-- ❌ INCORRECT — no test ID -->
<button (click)="generatePo()">Generate PO</button>
```

**Format:** `[module-prefix]-[element-type]-[action/purpose]` (kebab-case)

**Examples from this project:**

- `auth-login-email`, `auth-login-submit`, `auth-setup-wizard`
- `repo-generate-po-button`, `repo-po-history-table`
- `ktch-receiving-confirm-button`, `sync-offline-banner`
- `admn-uom-list-table`, `admn-uom-add-button`
- `rcnc-run-deduction-button`
- `vndr-price-edit-field-{ingredientId}`

### Test Numbering System

| Range     | Scope                                        |
| :-------- | :------------------------------------------- |
| T000–T099 | Authentication & Authorization (AUTH module) |
| T100–T199 | Admin App flows (ADMN module)                |
| T200–T299 | Master Data Setup (MSTR module)              |
| T300–T399 | PO & Replenishment (REPO module)             |
| T400–T499 | Kitchen Execution Hub (KTCH + SYNC modules)  |
| T500–T599 | Vendor Portal flows (VNDR module)            |
| T600–T699 | Reconciliation & Auditing (RCNC module)      |
| T700–T799 | Alert Engine (ALRT module)                   |
| T900–T999 | Edge cases & Error handling                  |

### E2E File Structure

```
e2e/
├── admin/
│   └── flows/
│       ├── authentication/       # T100-T109
│       ├── tenants/              # T110-T119
│       └── catalog/              # T120-T149
├── user-app/
│   └── flows/
│       ├── authentication/       # T000-T009
│       ├── master-data/          # T200-T249
│       ├── replenishment/        # T300-T349
│       ├── kitchen/              # T400-T449
│       └── reconciliation/       # T600-T649
├── helpers/
│   └── auth.helper.ts
└── playwright.config.ts          # Blocks production runs
```

### Writing Playwright Tests

```typescript
// e2e/user-app/flows/replenishment/T300-generate-po.spec.ts
import { test, expect } from "@playwright/test";

test.describe("T300: Auto-PO Generation", () => {
  test("T300.1: should generate draft PO from shortfall list in under 3 seconds", async ({ page }) => {
    await page.goto("/replenishment");
    const start = Date.now();
    await page.locator('[data-test-id="repo-generate-po-button"]').click();
    await expect(page.locator('[data-test-id="repo-po-draft-status"]')).toBeVisible();
    expect(Date.now() - start).toBeLessThan(3000);
  });
});
```

### Environment Safety

```typescript
// playwright.config.admin.ts
const baseURL =
  process.env["TEST_ENV"] === "production"
    ? (() => {
        throw new Error("E2E tests cannot run on production!");
      })()
    : process.env["TEST_ENV"] === "staging"
      ? "https://staging.stockpot.ph"
      : "http://localhost:4200"; // Default: emulators
```
