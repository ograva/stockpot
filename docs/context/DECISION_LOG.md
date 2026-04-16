# 📜 Architecture Decision Log (ADL)

> **Status Codes:** [PROPOSED] | [ACCEPTED] | [SUPERSEDED] | [DEPRECATED]

---

## ADL-001 — Shared Model Library Path: `projects/shared/` not `libs/core/models/` [ACCEPTED]

**Date:** April 15, 2026  
**Author:** Watson  
**Status:** ACCEPTED

**Context:**  
CONSTRAINTS.md states "Import all data models from `libs/core/models/`." The workspace has no `libs/` directory. The actual shared library was scaffolded at `projects/shared/`, registered as an Angular library in `angular.json`, and is importable via the `@stockpot/shared` TypeScript path alias defined in root `tsconfig.json`.

**Decision:**  
`projects/shared/src/models/` is the canonical source of truth for all Firestore model definitions. The import alias `@stockpot/shared` is the correct import path. `libs/core/models/` does not exist and will not be created. CONSTRAINTS.md updated to reflect `projects/shared/src/models/` and `@stockpot/shared`.

**Trade-offs:**  
The Angular library pattern (`projectType: library`) gives type safety and IDE support via the path alias. A separate `libs/` folder would require additional build configuration. No benefit for a single shared library.

**Impact:**  
CONSTRAINTS.md §Angular App Constraints Rule #5 updated. All shard implementations import from `@stockpot/shared`.

---

## ADL-002 — Platform Catalog Collections: Flat Top-Level over Nested Subcollections [ACCEPTED]

**Date:** April 15, 2026  
**Author:** Watson  
**Status:** ACCEPTED

**Context:**  
PRD specifies `platform/catalog/uom/{uomId}` and `platform/catalog/ingredients/{ingredientId}`. In Firestore, this creates a `platform` collection → `catalog` document → subcollections `uom` and `ingredients`. This pattern has two risks:  
1. `collectionGroup('uom')` queries would match any subcollection named `uom` across the entire database — potential for unintended results.  
2. Requires fetching the intermediate `catalog` document to access subcollections, adding a read operation.

**Decision:**  
Use flat top-level collections: `platform_uom/{uomId}` and `platform_ingredients/{ingredientId}`. Simple, unambiguous, no collectionGroup collision risk.

**Trade-offs:**  
Slightly unconventional naming. Pro: no hierarchy ambiguity, no intermediate document needed, Security Rules are simpler one-level `match`.

**Impact:**  
Architecture §6 Data Models and all Firestore Security Rules reference `platform_uom/` and `platform_ingredients/`. PRD §ADMN-005 and ADMN-006 ACs reference the old path — implementations must use the flat path from Architecture.md.

---

## ADL-003 — VendorDoc Collection Path: `suppliers/` not `vendors/` for Restaurant-Scoped Suppliers [ACCEPTED]

**Date:** April 15, 2026  
**Author:** Watson  
**Status:** ACCEPTED

**Context:**  
The existing `VendorDoc` placed restaurant-scoped suppliers at `restaurants/{restaurantId}/vendors/{vendorId}`. The PRD introduced a new platform-level vendor at top-level `vendors/{vendorId}`. These two paths share the word "vendors" and create a naming collision in Security Rules and developer mental models.

**Decision:**  
- **Platform-level suppliers:** Top-level `vendors/{vendorId}` → model `PlatformVendorDoc`  
- **Restaurant-scoped suppliers:** Subcollection `restaurants/{restaurantId}/suppliers/{supplierId}` → model `RestaurantSupplierDoc` (renamed from `VendorDoc`)

**Trade-offs:**  
Breaking change for any existing data at `restaurants/{rId}/vendors/`. Since the project is pre-launch with no production data, the path rename is safe. The model file `vendor.model.ts` is updated to `RESTAURANT_SUPPLIER_SCHEMA_VERSION = 2` with `isCustom` and `platformVendorRef` fields added.

**Impact:**  
All Firestore queries for restaurant suppliers must use `suppliers/` subcollection path. All references to `VendorDoc` in security rules updated to `RestaurantSupplierDoc`.

---

## ADL-004 — REPO-002 Auto-PO: Client-Side Computation, Not Cloud Function [ACCEPTED]

**Date:** April 15, 2026  
**Author:** Watson  
**Status:** ACCEPTED

**Context:**  
PRD NFR: Auto-PO generation completes in < 3 seconds for up to 50 shortfall line items. Two implementation options: (a) Cloud Function callable, (b) client-side computation with a single Firestore write result.

A Cloud Function cold start is 500ms–2000ms. Option (a) would make the 3-second NFR non-deterministic — achievable on warm starts, risky on cold starts. Option (b): the MSTR-008 Cloud Function already computed `parMinimum` values and wrote them to each `RawMaterialDoc`. The client-side Auto-PO engine only needs to: read `currentStock` vs `parMinimum` (from Firestore offline cache), group by supplier, apply buffer %, write one `PurchaseOrderDoc`. This is a local computation (~200ms including Firestore cache reads) followed by one network write.

**Decision:**  
REPO-002 is client-side. No Cloud Function is involved in PO generation. The PO doc write is the only Firestore operation.

**Trade-offs:**  
Potential consistency issue if two managers generate POs simultaneously for the same ingredients — both will see the same shortfall and may double-order. Mitigation: PO is a draft requiring owner approval; duplicates are visible in PO History (REPO-005) and are reconciled at approval time.

**Impact:**  
Architecture §5 REPO module breakdown and §7 API table updated. No Cloud Function registration required for REPO.

---

## ADL-005 — SYNC-003 Conflict Resolution: Last-Write-Wins with Audit Log [ACCEPTED]

**Date:** April 15, 2026  
**Author:** Watson  
**Status:** ACCEPTED

**Context:**  
PRD Open Question #5: When an offline stock adjustment conflicts with an online change from another user during the same period, what is the behavior? Two options: (a) last-write-wins, (b) manual review queue.

For v1, restaurants are single-location single-tenant entities. Multi-user concurrent stock editing is infrequent (typically: one staff member is receiving goods at a time). A manual review queue adds UI complexity and creates a "pending" limbo state that can confuse kitchen staff. Last-write-wins is predictable.

**Decision:**  
Last-write-wins. When `StoreForwardService` drains the queue and a write's local timestamp is older than the target document's `updatedAt`, the conflict is logged to `restaurants/{restaurantId}/syncConflicts/{conflictId}` before the write proceeds. The manager can review the conflict log via the stock adjustment screen (KTCH-004). No writes are blocked.

**Trade-offs:**  
In rare multi-user concurrent scenarios, the later offline write overwrites the earlier online adjustment. The conflict log provides an audit trail for reviewing discrepancies. A manual review queue (v2 candidate) would be safer but adds significant UX complexity for the v1 target persona.

**Impact:**  
Architecture §5 SYNC module breakdown and `StoreForwardService` implementation contract.

---

## ADL-006 — HWBR Deployment Model: Same-Machine Localhost Only in v1 [ACCEPTED]

**Date:** April 15, 2026  
**Author:** Watson  
**Status:** ACCEPTED

**Context:**  
PRD Open Question #1: Where does `/local-bridge/` live and what is its deployment model? There is a browser security constraint: a PWA served from HTTPS (`https://app.stockpot.ph`) cannot call `http://localhost:3500` due to mixed-content policy (HTTPS page → HTTP request is blocked).

Three resolution paths:  
(a) Bridge serves HTTPS with a self-signed cert — complex for non-technical kitchen owners.  
(b) Service worker proxy — routes bridge calls through a same-origin service worker path. High implementation complexity.  
(c) Same-machine constraint — User-App is accessed via `http://` (local IP) on the kitchen network, so both app and bridge are HTTP. No mixed-content issue.

**Decision:**  
v1: Bridge is same-machine local only. Kitchen workflows using hardware are accessed at `http://[local-ip]:4400` (the PWA served locally or accessed over kitchen LAN via HTTP). The Firebase Hosting HTTPS version works for all non-hardware workflows; the hardware bridge integration requires LAN access. `HardwareBridgeService` configures the bridge URL via HWBR-004 (user-configurable in app settings). If the URL is not configured or the bridge is unreachable (2s timeout), all receiving and printing workflows proceed in manual mode with zero degradation.

**Trade-offs:**  
Requires kitchen setup awareness — the owner must understand the bridge is a local server. Docker packaging (v2) will simplify this. The graceful fallback to manual mode ensures v1 is fully usable even if the bridge is never set up.

**Impact:**  
Architecture §5 HWBR module, `HardwareBridgeService` implementation contract, `ALLOWED_ORIGIN` env var configuration.

---

## ADL-007 — Admin Auth: Single Firebase Project with `platform_admin` Custom Claim [ACCEPTED]

**Date:** April 15, 2026  
**Author:** Watson  
**Status:** ACCEPTED

**Context:**  
PRD Open Question #3: How are platform operators authenticated — via a separate Firebase Auth tenant or custom claims in the same project? Two options: (a) separate Firebase project for admin, (b) single project with `platform_admin: true` custom claim.

A separate project would require: additional Firebase project setup, separate environment config, separate Auth emulator instances, and inability to read restaurant data from the admin app without cross-project APIs. A custom claim in the same project allows the Admin app to read Firestore documents across tenants while Security Rules strictly gate write operations.

**Decision:**  
Single Firebase project. Admin users have `platform_admin: true` custom claim set by the `assignAdminCustomClaim` Cloud Function. The first admin is bootstrapped manually via the Firebase Console custom claim editor. All subsequent admin accounts are invited by existing admins.

**Trade-offs:**  
Admin and restaurant users share the same Firebase Auth namespace. This is safe because Firestore Security Rules gate all admin-only operations behind `isPlatformAdmin()`. Risk: a compromised admin account has read access to all restaurant data. Mitigation: 2FA on all admin accounts (Firebase Auth supports TOTP MFA).

**Impact:**  
Architecture §8 Security Model, ADMN-001 implementation, `AdminCoreService` auth pattern.

---

## ADL-008 — Ingredient Chain Model: DAG with Unbounded Nesting, Typed Recipe Variants, and Optional Sub-Component PAR [ACCEPTED]

**Date:** April 16, 2026  
**Author:** Watson  
**Status:** ACCEPTED

**Context:**  
The original models defined a shallow ingredient chain: `SubComponent` could only reference `RawMaterial` (no nesting), and `Recipe` referenced both. Three design gaps were identified through product review:

1. **Nesting depth** — Real kitchen prep commonly produces intermediates that themselves build on other intermediates (e.g., a "Spiced Oil" sub-component uses a "Herb Blend" sub-component). The flat model forced duplication of ingredient lists.

2. **Recipe type** — The system had no distinction between batch-prepared dishes (ice cream, cookies — finished portions are stockable) and made-to-order dishes (pasta, burgers — no finished-portion inventory). Deduction triggers and stock tracking logic differ between these two types.

3. **Sub-component inventory and alerts** — `SubComponent` had no `currentStock`, so kitchen batch tracking and low-stock alerting was impossible at the intermediate-prep level. `RawMaterial` already had `parMinimum` and `criticalThreshold`; sub-components had no equivalent.

**Decision:**

**1 — DAG traversal model for ingredient nesting.**  
`SubComponent` is updated to schema v2 to carry both `rawIngredients[]` (was `ingredients[]`, renamed for symmetry) and a new `subComponentIngredients[]` array enabling unbounded nesting. The ingredient chain is treated as a Directed Acyclic Graph (DAG). Cycle detection is the responsibility of the traversal engine (back-calculation, cost propagation), not the data model. The engine maintains an ephemeral `visited: Set<string>` keyed as `"subComponent:{id}"` or `"rawMaterial:{id}"` per run. If a node is encountered a second time, a warning is logged and traversal of that branch is skipped — no infinite loop, no silent double-counting. This is simpler and more transparent than a stored tree structure, which would require denormalization and mutation-time consistency maintenance.

**2 — `RecipeType` discriminator on `RecipeDoc`.**  
`Recipe` is updated to schema v3 to carry `recipeType: 'PRE_MADE' | 'COOKED_TO_ORDER'`.  
- `PRE_MADE`: ingredient deduction occurs at prep-batch initiation; `currentStock` (finished portions) is tracked and decremented at service.  
- `COOKED_TO_ORDER`: ingredient deduction also occurs at cooking initiation (not at point of sale); no finished-portion inventory is maintained (`currentStock` stays 0).  
Both types share the same deduction trigger point — preparation initiation — intentionally. This prevents the system from waiting until an order is fulfilled before debiting stock, which would break real-time inventory accuracy in a busy kitchen.

**3 — Optional sub-component PAR and alert fields.**  
`SubComponent` gains `currentStock`, `parMinimum?`, and `criticalThreshold?`.  
`parMinimum` and `criticalThreshold` are optional and default to `0`. When `0`, no alert is evaluated — `serialize()` omits them from Firestore to avoid writing meaningless zeros for operators who do not track batch-level PAR. Operators who want reorder alerts on sauce batches, dough, or other intermediates configure these values via the master data UI.

**4 — Instructions as ordered HTML string arrays.**  
Both `SubComponent` and `Recipe` gain `instructions: string[]`. Each element is an HTML string rendered via `[innerHTML]` in the Angular template, supporting bold, numbered lists, and basic formatting without introducing a separate rich-text storage format. Sanitization is applied at render time per Angular's built-in DomSanitizer.

**Trade-offs:**

| Concern | Decision | Alternative Considered |
|---|---|---|
| Cycle detection | Ephemeral visited Set in traversal engine | Stored DAG tree (too much write-time complexity) |
| Recipe inventory | `currentStock` on `Recipe` only for PRE_MADE; 0 for COOKED_TO_ORDER | Separate `PrepBatch` collection (over-engineering for v1) |
| Sub-component PAR | Optional fields, omitted at 0 | Mandatory with 0 as "off" (would litter Firestore with zeros) |
| Instructions format | HTML string array | Markdown, ProseMirror delta, or plain string (HTML is simplest for render without a parser) |

**Breaking changes:**

- `SubComponent` schema v1 `ingredients[]` → v2 `rawIngredients[]`. `deserializeSubComponent()` contains the migration gate: if `_schemaVersion < 2`, read from `ingredients` field and map to `rawIngredients`.
- `Recipe` schema v2 → v3. `deserializeRecipe()` fills `recipeType = 'COOKED_TO_ORDER'`, `instructions = []`, `currentStock = 0` for all existing records. No data loss.

**Impact:**  
- `projects/shared/src/models/sub-component.model.ts` — bumped to `SUB_COMPONENT_SCHEMA_VERSION = 2`  
- `projects/shared/src/models/recipe.model.ts` — bumped to `RECIPE_SCHEMA_VERSION = 3`  
- Back-calculation engine (MSTR-008 Cloud Function) must be updated to traverse `subComponentIngredients[]` recursively with cycle guard  
- KTCH deduction handler must branch on `recipeType` to decide whether to debit `Recipe.currentStock` or pass through to raw materials  
- ALRT engine must include `SubComponent` documents in its low-stock scan alongside `RawMaterial`  
- MSTR module UI components for sub-component and recipe editing require updated forms  

---

## ADL-008 — Vendor Portal Auth: Email Magic Link Invite + Optional Password Link [ACCEPTED]

**Date:** April 15, 2026  
**Author:** Watson  
**Status:** ACCEPTED

**Context:**  
PRD DEC-3: Does the Vendor Portal use email-link-only auth (passwordless) or email/password? Vendor reps are invited by the admin (ADMN-007) via `sendSignInLinkToEmail`. Without a secondary step, they can only log back in by requesting a new magic link — usable but may feel cumbersome for weekly portal use.

**Decision:**  
First login: email magic link (invite flow). On first portal session, vendor is prompted once to link an email/password credential via `linkWithEmailAndPassword`. Subsequent logins: email/password. The linking step is optional but recommended; dismissing it means the vendor continues with magic link auth for future sessions.

**Trade-offs:**  
Slightly more complex first-login UX than pure email/password. Pro: no password transmission during invite; consistent with modern invite conventions (Slack, Notion). The optional password-link step allows vendors to choose their auth style.

**Emulator Testing Constraint:**  
The Firebase Auth emulator does not deliver real emails. `sendSignInLinkToEmail` is intercepted locally but the magic link is inaccessible without inspecting emulator REST logs — impractical for routine dev/QA. Therefore: when `environment.useEmulators === true`, the Vendor Portal login page **must** display a standard `signInWithEmailAndPassword` form instead of the magic-link request form. This is gated via the environment flag and requires no separate code path in production.

```typescript
// VendorLoginComponent
if (environment.useEmulators) {
  // Render email/password form directly
} else {
  // Render magic link request form (production)
}
```

**Impact:**  
VNDR-001 implementation, `VendorCoreService` auth flow, Vendor Portal login page.

---

## ADL-009 — `RecipeDoc` Quantities: Per-Portion Model Retained [ACCEPTED]

**Date:** April 15, 2026  
**Author:** Watson  
**Status:** ACCEPTED

**Context:**  
BRK-4 from the technical review flagged a potential schema conflict: the existing `RecipeDoc` stores ingredient quantities per-portion, while the PRD's MSTR-008 back-calculation requires computing raw material minimums from `parPortions`. Concern: does this require a per-batch model with a `batchYield` field?

**Analysis:**  
The back-calculation formula works cleanly with per-portion quantities:  
- Direct ingredient: `parMinimum = parPortions × qty_per_portion`  
- Via sub-component: `parMinimum = parPortions × (subComp_qty_per_portion / subComp.yieldQty) × rawMaterial_qty`  
No `batchYield` on the recipe itself is needed. `SubComponentDoc` already has `yieldQty` and `yieldPercent` for the sub-component batch output.

**Decision:**  
`RecipeDoc` retains per-portion ingredient quantities. The only addition is `parPortions: number` (v2). No `batchYield` field added to recipes.

**Trade-offs:**  
If future requirements need batch production tracking (e.g., "prep 50 portions at once"), the per-portion model divides cleanly. No trade-off identified.

**Impact:**  
Architecture §6 `RecipeDoc` v2 schema, MSTR-008 Cloud Function implementation.
