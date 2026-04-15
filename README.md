# StockPot

A three-sided SaaS platform built by **Novus Apps** for SMB restaurants in the Philippines. StockPot digitizes a proven restaurant cost-management model into a closed-loop system that couples purchasing, receiving, preparation, and sales reconciliation — eliminating the food-cost guesswork that erodes margin.

## Overview

StockPot is the digital operationalization of a 30-year-old restaurant cost model. It is not a generic inventory system — it is a purpose-built, opinionated platform with tight data relationships: raw materials have yield percentages, sub-components have prep chains, recipes have par-level targets, and the gap between "what we have" and "what we need" is always one tap away.

### The Three Applications

| App | Port | Audience | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | 4200 | Platform operator | Tenant management, subscriptions, platform ingredient catalog, supplier network |
| **User-App** | 4400 | Restaurant staff (owner / manager / kitchen staff) | Master data, replenishment, kitchen execution, offline receiving, reconciliation, alerts |
| **Vendor Portal** | 4600 | Food suppliers | Self-service catalog management, pricing updates, incoming PO view |

Plus a local **Hardware Bridge** (`local-bridge/`, port 3500) — a Node.js Express server that proxies weighing scales and thermal printers on-premise.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Angular 21 — standalone components, Angular Signals |
| **UI** | Angular Material 21 + Tailwind CSS 4 (Material for behavior, Tailwind for layout) |
| **Backend** | Firebase Auth, Firestore, Cloud Functions (Node.js 22), Storage, FCM |
| **Shared Models** | `@stockpot/shared` — DAT-302 pattern: `SCHEMA_VERSION` + `serialize()` / `deserialize()` |
| **Offline** | `StoreForwardService` — zero data loss, IndexedDB-backed queue |
| **Hardware** | Node.js Express bridge for serial scales + ESC/POS thermal printers |
| **Testing** | Playwright + Chromium (E2E) · Jasmine + Karma (unit) |
| **State** | Angular Signals only — no `BehaviorSubject` |

---

## Quick Start

> **Emulators must start before Angular apps.** Bootstrap calls `connectAuthEmulator()` and `connectFirestoreEmulator()` — missing emulators cause silent CORS failures.

```bash
# Recommended: everything in one command
npm run dev

# Or start processes individually
npm run firebase:emulators    # Firebase emulators → http://localhost:8080
npm run start                 # Admin app         → http://localhost:4200
npm run start:user            # User-App PWA      → http://localhost:4400
npm run start:vendor          # Vendor Portal     → http://localhost:4600
npm run start:bridge          # Hardware bridge   → http://localhost:3500
```

### Prerequisites

- Node.js 22 LTS
- `npm install` from the workspace root
- `cd functions && npm install` (separate dependency tree)
- Firebase CLI: `npm install -g firebase-tools`

---

## All Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | All apps + Firebase emulators (recommended for daily dev) |
| `npm run start` | Admin app only → port 4200 |
| `npm run start:user` | User-App only → port 4400 |
| `npm run start:vendor` | Vendor Portal → port 4600 |
| `npm run start:bridge` | Hardware bridge → port 3500 |
| `npm run start:all` | All 3 Angular apps (no emulators) |
| `npm run firebase:emulators` | Firebase emulators only → UI at port 8080 |
| `npm run build` | Production build — all apps |
| `npm run build:admin` | Admin only |
| `npm run build:user` | User-App only |
| `npm run build:vendor` | Vendor Portal only |
| `npm test` | Karma + Jasmine unit tests |
| `npm run test:e2e:admin` | Playwright E2E — Admin (requires apps + emulators running) |
| `npm run test:e2e:user` | Playwright E2E — User-App |
| `npm run test:e2e` | Both E2E suites |
| `npm run firebase:emulators:export` | Save emulator state to `emulator-data/` |
| `npm run firebase:deploy` | Deploy to Firebase Hosting (production) |

---

## Workspace Structure

```
stockpot/
├── projects/
│   ├── admin/          # Port 4200 — platform operator dashboard
│   ├── user-app/       # Port 4400 — restaurant PWA (offline-first)
│   ├── vendor-app/     # Port 4600 — supplier self-service portal
│   └── shared/         # @stockpot/shared — all Firestore models (DAT-302)
│
├── local-bridge/       # Port 3500 — Node.js Express hardware bridge
├── functions/          # Firebase Cloud Functions (Node.js 22)
├── environments/       # Firebase config: local / staging / prod
├── e2e/                # Playwright E2E tests
├── emulator-data/      # Firebase emulator snapshot for local dev
└── docs/
    ├── context/        # ✅ LIVING DOCS — PRD, Architecture, CONSTRAINTS, DECISION_LOG
    ├── stories/        # 54 user story files (10 module folders)
    └── testing/        # Test strategy and registry
```

All Firestore model interfaces live in `projects/shared/src/models/` and are imported via:

```typescript
import { RestaurantDoc, deserializeRestaurant } from '@stockpot/shared';
```

Never duplicate model definitions inside individual app `src/` folders.

---

## Product Modules

| Prefix | Module | App | Sprint |
| :--- | :--- | :--- | :--- |
| `AUTH` | Authentication & Onboarding | user-app | 1 |
| `ADMN` | Admin App (Platform Operator) | admin | 1 |
| `MSTR` | Restaurant Master Data Setup | user-app | 1 |
| `REPO` | Smart PO & Replenishment Engine | user-app | 2 |
| `KTCH` | Kitchen Execution Hub | user-app | 2 |
| `SYNC` | Offline Sync & Receiving | user-app | 2 |
| `HWBR` | Local Hardware Bridge | local-bridge | 2 |
| `VNDR` | Vendor / Supplier Portal | vendor-app | 2 |
| `RCNC` | Reconciliation & Variance Auditing | user-app | 3 |
| `ALRT` | Alert Engine | user-app + CF | 3 |

---

## Port Reference

| Port | Service | Used By |
| :--- | :--- | :--- |
| 4200 | Admin Angular app | Browser, Playwright admin E2E |
| 4400 | User-App Angular PWA | Browser, Playwright user E2E |
| 4600 | Vendor Portal Angular app | Browser |
| 3500 | Local Hardware Bridge (Express) | User-App browser (same machine only) |
| 8080 | Firebase Emulator UI | Browser |
| 8085 | Firestore Emulator | All Angular apps |
| 9099 | Auth Emulator | All Angular apps |
| 5001 | Functions Emulator | All Angular apps |
| 9199 | Storage Emulator | All Angular apps |

---

## Documentation

| Document | Description |
| :--- | :--- |
| [docs/context/PRD.md](docs/context/PRD.md) | Feature modules, 54 user stories, acceptance criteria, NFRs |
| [docs/context/Architecture.md](docs/context/Architecture.md) | Tech stack, data models, Firestore collections, system diagrams |
| [docs/context/CONSTRAINTS.md](docs/context/CONSTRAINTS.md) | Golden rules — all code must comply |
| [docs/context/DECISION_LOG.md](docs/context/DECISION_LOG.md) | ADL-001 → ADL-009 — architectural decision history |
| [docs/context/ProjectBrief.md](docs/context/ProjectBrief.md) | Executive summary and strategic KPIs |
| [docs/testing/](docs/testing/) | Testing strategy, Playwright setup, test registry |
| [docs/FIREBASE_EMULATORS.md](docs/FIREBASE_EMULATORS.md) | Emulator configuration and data management |

> **Note:** `docs/base_template/` contains blank starter templates — do not treat it as project state.

---

**Built by Novus Apps · StockPot v1.0 · Angular 21 + Firebase**