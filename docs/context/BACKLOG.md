# 📋 Master Backlog: StockPot

> This is an **index registry** only. Full shard content lives in `docs/shards/[PREFIX]/`.
> **Status Lifecycle:** `Not Started` → `In Progress` → `Completed` → `Superseded`

## Project Context

| Role | Person |
| :--- | :--- |
| **Product Manager** | Jason (PM) |
| **Architect** | Watson |
| **Product Owner / Sharder** | Poe (PO) |
| **UI/UX Designer** | Eunice |
| **QA** | Quinn |
| **Lead Dev** | Athena |

- **Project Brief:** [ProjectBrief.md](ProjectBrief.md)
- **PRD:** [PRD.md](PRD.md)
- **Architecture:** [Architecture.md](Architecture.md)
- **UI/UX Design Guide:** [UI_UX_Design_Guide.md](UI_UX_Design_Guide.md)
- **Decision Log:** [DECISION_LOG.md](DECISION_LOG.md)

---

## Phase 1 — Foundation & Master Data (Sprint 1)

### MODULE: AUTH — User-App Authentication & Onboarding

| Shard ID | Title | Module | Priority | Status | Complexity | Story Ref | File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| AUTH-001 | Login with Email & Password | AUTH | High | Completed | S | AUTH-001 | [AUTH-001](../shards/AUTH/AUTH-001-login.md) |
| AUTH-002 | Role-Based Route Guards | AUTH | High | Completed | S | AUTH-002 | [AUTH-002](../shards/AUTH/AUTH-002-role-based-route-guards.md) |
| AUTH-003 | First-Run Restaurant Setup Wizard | AUTH | High | Completed | M | AUTH-003 | [AUTH-003](../shards/AUTH/AUTH-003-first-run-setup-wizard.md) |
| AUTH-004 | Profile & Password Management | AUTH | Medium | Not Started | S | AUTH-004 | [AUTH-004](../shards/AUTH/AUTH-004-profile-password-management.md) |

### MODULE: ADMN — Admin App (Platform Operator)

| Shard ID | Title | Module | Priority | Status | Complexity | Story Ref | File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ADMN-001 | Admin App Login | ADMN | High | Not Started | S | ADMN-001 | [ADMN-001](../shards/ADMN/ADMN-001-admin-login.md) |
| ADMN-002 | Tenant (Restaurant) CRUD | ADMN | High | Not Started | M | ADMN-002 | [ADMN-002](../shards/ADMN/ADMN-002-tenant-crud.md) |
| ADMN-003 | Subscription Tier Assignment | ADMN | High | Not Started | S | ADMN-003 | [ADMN-003](../shards/ADMN/ADMN-003-subscription-tier-assignment.md) |
| ADMN-004 | Platform Dashboard | ADMN | Medium | Not Started | M | ADMN-004 | [ADMN-004](../shards/ADMN/ADMN-004-platform-dashboard.md) |
| ADMN-005 | Master UoM Library Management | ADMN | High | Not Started | M | ADMN-005 | [ADMN-005](../shards/ADMN/ADMN-005-master-uom-library.md) |
| ADMN-006 | Master Ingredient Catalog Management | ADMN | High | Not Started | M | ADMN-006 | [ADMN-006](../shards/ADMN/ADMN-006-master-ingredient-catalog.md) |
| ADMN-007 | Supplier Network Management | ADMN | High | Not Started | M | ADMN-007 | [ADMN-007](../shards/ADMN/ADMN-007-supplier-network-management.md) |
| ADMN-008 | Supplier Product Catalog Admin View | ADMN | Medium | Not Started | S | ADMN-008 | [ADMN-008](../shards/ADMN/ADMN-008-supplier-catalog-admin-view.md) |
| ADMN-009 | Assign Ingredients to Supplier Catalog | ADMN | High | Not Started | M | ADMN-009 | [ADMN-009](../shards/ADMN/ADMN-009-assign-ingredients-to-supplier.md) |
| ADMN-010 | Operator Profile Management | ADMN | Low | Not Started | XS | ADMN-010 | [ADMN-010](../shards/ADMN/ADMN-010-operator-profile-management.md) |

### MODULE: MSTR — Restaurant Master Data Setup

| Shard ID | Title | Module | Priority | Status | Complexity | Story Ref | File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| MSTR-001 | Select Active UoMs from Platform Library | MSTR | High | Not Started | S | MSTR-001 | [MSTR-001](../shards/MSTR/MSTR-001-select-active-uoms.md) |
| MSTR-002 | Raw Material Setup — Platform Catalog | MSTR | High | Not Started | M | MSTR-002 | [MSTR-002](../shards/MSTR/MSTR-002-raw-material-platform-catalog.md) |
| MSTR-003 | Raw Material Setup — Custom Ingredient | MSTR | High | Not Started | S | MSTR-003 | [MSTR-003](../shards/MSTR/MSTR-003-raw-material-custom-ingredient.md) |
| MSTR-004 | Link Raw Material to Supplier | MSTR | High | Not Started | S | MSTR-004 | [MSTR-004](../shards/MSTR/MSTR-004-link-raw-material-to-supplier.md) |
| MSTR-005 | Sub-Component CRUD | MSTR | High | Not Started | M | MSTR-005 | [MSTR-005](../shards/MSTR/MSTR-005-sub-component-crud.md) |
| MSTR-006 | Recipe CRUD & Portion Definition | MSTR | High | Not Started | M | MSTR-006 | [MSTR-006](../shards/MSTR/MSTR-006-recipe-crud.md) |
| MSTR-007 | Recipe Ingredient Chain Mapping | MSTR | High | Not Started | L | MSTR-007 | [MSTR-007](../shards/MSTR/MSTR-007-recipe-ingredient-chain-mapping.md) |
| MSTR-008 | Par Level Config & Back-Calculation Engine | MSTR | High | Not Started | XL | MSTR-008 | [MSTR-008](../shards/MSTR/MSTR-008-par-level-back-calculation.md) |

---

> **⚠️ Phase 2 (Sprint 2: REPO, KTCH, SYNC, HWBR, VNDR) and Phase 3 (Sprint 3: RCNC, ALRT) shards are pending — to be created after Phase 1 shards reach _Completed_ status.**
