# 📋 Master Backlog: Novus Flexy Template

## 🛠 Project Context

- **Project Brief:** [ProjectBrief.md](docs/context/ProjectBrief.md)
- **PRD:** [PRD.md](docs/context/PRD.md)
- **Lead Architect:** Watson
- **Product Manager:** Jason

---

## 🚦 Implementation Roadmap

### 🟩 Phase 1: Foundation & Infrastructure (SYS-100)

| ID          | Shard Name                      | Description                                                              | Status    | Files Involved                                         |
| :---------- | :------------------------------ | :----------------------------------------------------------------------- | :-------- | :----------------------------------------------------- |
| **SYS-101** | Firebase Project Init           | Initialize Firebase Auth/Firestore and baseline rules.                   | ✅ Done   | `firebase.json`, `firestore.rules`                     |
| **SYS-102** | Tailwind CSS Hybrid             | Integrate Tailwind v4+ with Material Theme sync.                         | ✅ Done   | `tailwind.config.js`, `styles.scss`                    |
| **SYS-103** | Firebase Emulator Environment   | Java 21 + emulator setup for Auth, Firestore, Storage, Functions.        | ✅ Done   | `firebase.json`, `devcontainer.json`, `emulator-data/` |
| **SYS-104** | Centralise Auth Listener        | Single `onAuthStateChanged` in `AppComponent`; `CoreService` as store.   | ✅ Done   | `app.component.ts`, `core.service.ts`, `auth.guard.ts` |

### 🟨 Phase 2: Authentication & Initialization (AUT-200)

| ID          | Shard Name           | Description                                                 | Status  | Files Involved                             |
| :---------- | :------------------- | :---------------------------------------------------------- | :------ | :----------------------------------------- |
| **AUT-201** | Launch Splash Screen | Implement initialization splash with Angular Signals logic. | ✅ Done   | `splash.component.ts`, `app.routes.ts`     |
| **AUT-202** | Global Auth UI       | Header icon and Sidebar "Login/Logout" dynamic toggles.     | ✅ Done   | `header.component.html`, `sidebar-data.ts` |

### 🟦 Phase 3: Core Application Flows (USR-500 & ADM-400)

| ID          | Shard Name             | Description                                                              | Status  | Files Involved                            |
| :---------- | :--------------------- | :----------------------------------------------------------------------- | :------ | :---------------------------------------- |
| **USR-501** | User App Home          | Responsive Home page with Flexy Layout.                                  | ✅ Done | `projects/user-app/src/...`               |
| **USR-502** | User Profile Form      | Self-service profile form (user-app only) syncing via Store-and-Forward. | ✅ Done | `profile.component.ts`                    |
| **USR-503** | First-Login Onboarding | Redirect new users to complete profile before reaching home page.        | ✅ Done | `profile.component.ts`, `splash.component.ts` |
| **ADM-401** | Admin Auth-Gate        | Protected routes and Admin-specific login redirects.                     | ✅ Done   | `app.routes.ts`, `auth.guard.ts`          |
| **ADM-402** | User Management List   | Material Data Table listing from Firestore `users` collection.           | ✅ Done   | `users.component.ts`                      |
| **ADM-403** | Site Settings Page     | Admin UI to read/write Firestore `settings/global` document.             | ✅ Done   | `settings.component.ts`                   |
| **ADM-404** | User Create/Edit Form  | Create new users and edit existing user profiles and roles.              | ✅ Done   | `user-form.component.ts`                  |

### 🟫 Phase 3b: Data Layer (DAT-300)

| ID          | Shard Name                        | Description                                                                        | Status    | Files Involved                                              |
| :---------- | :-------------------------------- | :--------------------------------------------------------------------------------- | :-------- | :---------------------------------------------------------- |
| **DAT-301** | StoreForwardService               | Two-stage Store-and-Forward: LocalStorage → Firestore background sync.             | ✅ Done   | `store-forward.service.ts`                                  |
| **DAT-302** | Firestore Document Model Interfaces | Typed interfaces + serialize/deserialize + `_schemaVersion` for every Firestore collection. | ✅ Done | `user-profile.model.ts`, `site-settings.model.ts`, `settings.service.ts` |
| **DAT-303** | StoreForward Transforms           | Pluggable `serialize`/`deserialize` transforms on `StoreForwardService` call sites. | ✅ Done  | `store-forward.service.ts`, `profile.component.ts`          |

### 🟪 Phase 4: Quality & Automation (TST-900)

| ID          | Shard Name                  | Description                                                   | Status  | Files Involved                      |
| :---------- | :-------------------------- | :------------------------------------------------------------ | :------ | :---------------------------------- |
| **TST-901** | Playwright Multi-App        | E2E configuration for both Admin (4200) and User (4400) apps. | ✅ Done | `playwright.config.ts`              |
| **TST-902** | Admin Logout E2E            | E2E tests for sidebar Logout flow and auth-conditional nav.   | ✅ Done | `T002-logout.spec.ts`               |
| **TST-903** | Admin Registration E2E      | E2E tests for registration form, validation, and happy path.  | ✅ Done | `T003-register.spec.ts`             |
| **TST-904** | Admin Splash Transition E2E | E2E tests for splash render and auth-driven redirect routing. | ✅ Done | `T010-splash.spec.ts`               |
| **TST-905** | E2E Auth Infrastructure     | global-setup seed user, reusable auth helper, CI sequencing.  | ✅ Done | `global-setup.ts`, `auth.helper.ts` |

---

## 🧩 Shard Details

### [SYS-101] - Firebase Project Init

- **Goal:** Establish the backend foundation for both apps.
- **Context:** Requires `email/password` auth and `firestore.rules` for basic read/write lockdown.
- **Definition of Done:**
  - [ ] Local Firebase Emulators initialized.
  - [ ] `firestore.rules` deployed for baseline security.
  - [ ] `users` and `settings` collections accessible in Emulator UI.

### [AUT-201] - Launch Splash Screen

- **Goal:** Provide initialization feedback and perform background auth checks.
- **Context:** Signal-based logic to determine "Splash -> Login" or "Splash -> Home".
- **Definition of Done:**
  - [ ] 2-second minimum visibility.
  - [ ] Novus Apps branding applied via Tailwind.
  - [ ] Integrated into `app.routes.ts` as the primary entry point.

---

## 🔧 Deferred Upgrades / Tech Debt

| Package         | Current  | Target | Blocker                       | Notes                                                                                                                          |
| :-------------- | :------- | :----- | :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `@angular/fire` | `20.0.1` | `21.x` | Waiting for stable release    | `21.0.0-rc.0` exists but also requires `firebase@^12` (major bump). Upgrade both together once `@angular/fire@21` hits stable. |
| `firebase`      | `11.x`   | `12.x` | Blocked by `@angular/fire@21` | firebase@12 is required by `@angular/fire@21`. Do not upgrade in isolation.                                                    |

---

## 🏁 Quality Gate

- [ ] **Alignment:** Does the current build match Jason's PRD?
- [ ] **Integrity:** Does the code follow Watson's architecture?
- [ ] **Testing:** Has the Playwright suite (TST-9XX) verified the flows on Mobile/Desktop?
