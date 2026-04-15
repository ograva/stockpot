# {{PROJECT_NAME}} - AI Coding Guidelines

> ⚠️ **Setup Instructions:** This is a template file. When starting a new project:
> 1. Copy this file to `.github/copilot-instructions.md`
> 2. Replace all `{{PLACEHOLDER}}` values with your project specifics
> 3. OR run the `.github/prompts/sync-copilot-instructions.prompt.md` prompt after your `docs/context/` files are complete — it will generate this file automatically from your ProjectBrief, PRD, and Architecture docs.

---

## Project Overview

**{{PROJECT_NAME}}** is {{PROJECT_DESCRIPTION}}.

| Detail | Value |
| :--- | :--- |
| **Owner** | {{PROJECT_OWNER}} |
| **Stack** | Angular (latest) + Firebase |
| **Architecture** | Angular Monorepo |
| **Primary Apps** | Admin (port 4200), {{USER_APP_NAME}} (port 4400) |
| **Backend** | Firebase Auth, Firestore, Cloud Functions, Storage |

> For full product context, read `docs/context/ProjectBrief.md` and `docs/context/PRD.md`.
> For system design decisions, read `docs/context/Architecture.md`.
> For hard coding rules, read `docs/context/CONSTRAINTS.md`.

---

## Workspace Structure

```
{{REPO_NAME}}/
├── projects/
│   ├── admin/              # Admin dashboard (port 4200)
│   └── {{USER_APP_DIR}}/   # {{USER_APP_DESCRIPTION}} (port 4400)
├── functions/              # Firebase Cloud Functions (Node.js 22)
├── environments/           # Shared Firebase configurations
├── libs/                   # Shared models, services, utilities
├── e2e/                    # Playwright E2E tests
└── docs/
    ├── context/            # ← Live project docs (PRD, Architecture, etc.)
    └── base_template/      # Blank starter templates — DO NOT use as project reference
```

> Reference `docs/MONOREPO USE GUIDE.md` for how to run all three processes locally.

---

## Product Modules

> **Derived from `docs/context/PRD.md`.** Replace the table below with the actual modules defined by Jason (PM).

| Prefix | Module Name | Description |
| :--- | :--- | :--- |
| `{{MOD1}}` | {{MODULE_1_NAME}} | {{MODULE_1_DESC}} |
| `{{MOD2}}` | {{MODULE_2_NAME}} | {{MODULE_2_DESC}} |
| `{{MOD3}}` | {{MODULE_3_NAME}} | {{MODULE_3_DESC}} |

---

## Architecture Conventions

> **Derived from `docs/context/Architecture.md`.** Replace the sections below with Watson's actual architectural decisions.

### State Management
- **Angular Signals only.** No manually managed `BehaviorSubject` or `Subject` for shared state.
- Use `signal()` + `computed()` + `effect()` for all reactive state.

### Data Layer (DAT-302)
Every Firestore model must follow this pattern:
```typescript
export const SCHEMA_VERSION = 1;

export interface {{ModelName}}Doc {
  // fields...
}

export function serialize(data: {{ModelName}}Doc): Record<string, unknown> {
  // never write null to Firestore — omit undefined/empty optionals
}

export function deserialize(raw: Record<string, unknown>): {{ModelName}}Doc {
  // handle schema migration, fill defaults
}
```

### Component Pattern
```typescript
// Standalone Angular component (no NgModules except MaterialModule)
@Component({
  selector: 'app-{{feature}}',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './{{feature}}.component.html',
  styleUrls: ['./{{feature}}.component.scss']
})
export class {{Feature}}Component { }
```

### Module Organization
- **Standalone components** (Angular latest) — no NgModules except `MaterialModule`
- `MaterialModule`: Central re-export of all Material imports
- Import `MaterialModule` in components, never individual Material modules
- All shared data models live in `libs/core/models/` — never duplicate in `src/`

### Routing
```typescript
// Lazy loading with loadChildren
{
  path: '{{feature}}',
  loadChildren: () => import('./pages/{{feature}}/{{feature}}.routes')
    .then((m) => m.{{Feature}}Routes)
}
```
- Route files named `*.routes.ts` exporting `Routes` constant
- All routes nested under `FullComponent` (authenticated) or `BlankComponent` (public)

### Service Injection
- All services use `providedIn: 'root'` (singleton)
- No manual provider registration in components

### Styling
- Material (latest) + Tailwind 4 hybrid
- Material for complex component behaviors; Tailwind for layout and spacing

---

## Development Commands

```bash
npm run dev                  # Start all: admin + user-app + Firebase emulators
npm run start                # Admin app only (port 4200)
npm run start:user           # User app only (port 4400)
npm run firebase:emulators   # Firebase emulators only
npm run build                # Production build
npm test                     # Karma + Jasmine unit tests
npm run test:e2e:admin       # Playwright E2E — admin
npm run test:e2e:user        # Playwright E2E — user app
```

---

## Key Files Reference

> Update this table after Watson completes `docs/context/Architecture.md`.

| File | Purpose |
| :--- | :--- |
| `projects/admin/src/app/app.config.ts` | Admin app providers |
| `projects/admin/src/app/app.routes.ts` | Admin top-level routing |
| `projects/admin/src/app/material.module.ts` | Central Material re-exports |
| `projects/{{USER_APP_DIR}}/src/app/app.config.ts` | User app providers |
| `environments/environment.local.ts` | Local emulator config (shared by both apps) |
| `functions/src/index.ts` | Cloud Functions entry point |
| `docs/context/Architecture.md` | System design source of truth |
| `docs/context/PRD.md` | Product requirements source of truth |
| `docs/context/CONSTRAINTS.md` | Hard coding rules — read before every change |

---

## Common Pitfalls

- **Don't** import individual Material modules — always use `MaterialModule`
- **Don't** use RxJS `BehaviorSubject` for new state — use Angular Signals
- **Don't** create NgModules — use standalone component pattern
- **Don't** write `null` to Firestore — omit the field or use `deleteField()`
- **Don't** duplicate model interfaces inside `src/` — import from `libs/core/models/`
- **Don't** read `docs/base_template/` for project context — it's a blank starter, not live docs

---

## Testing Philosophy

Every feature is designed for testability from the ground up.

### Strategy
1. **Unit Tests** — Jasmine/Karma for component logic and model transforms (`serialize`/`deserialize`)
2. **E2E Tests** — Playwright with Chromium for all user flows
3. **Test Data Attributes** — Every interactive element gets `data-test-id`
4. **Environment Safety** — E2E tests run only against emulators or staging, never production

### `data-test-id` Convention

Format: `[page]-[element]-[purpose]`

```html
<!-- ✅ CORRECT -->
<button data-test-id="login-submit-button" (click)="login()">Login</button>
<input data-test-id="login-email-input" type="email" />
<mat-select data-test-id="profile-role-selector" />

<!-- ❌ INCORRECT — no test ID -->
<button (click)="login()">Login</button>
```

### E2E Test Numbering (see `docs/testing/TEST_REGISTRY.md` for full registry)

| Range | Area |
| :--- | :--- |
| T000–T099 | Authentication & Authorization |
| T100–T199 | User Management |
| T200–T299 | Dashboard & Analytics |
| T300–T399 | Content Management |
| T400–T499 | Settings & Configuration |
| T500–T599 | {{USER_APP_NAME}} — Onboarding & Core Flows |
| T900–T999 | Edge Cases & Error Handling |

### E2E File Structure

```
e2e/
├── admin/flows/{{module}}/    T0XX-feature.spec.ts
├── user-app/flows/{{module}}/ T5XX-feature.spec.ts
└── helpers/                   Shared auth helpers, fixtures
```
