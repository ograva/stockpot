# Product Requirements Document (PRD): Novus Flexy Template

| Version | Status | Date | Owner |
| :--- | :--- | :--- | :--- |
| 1.0 | 🟢 Draft | 2026-03-14 | Jason (PM) |

## 1. Product Overview
Novus Flexy is an Angular 21 monorepo template designed for Novus Apps. It provides a pre-scaffolded environment for building client-facing applications with two distinct frontend projects (Admin and User) sharing a unified Firebase-backed data and authentication layer.

### 1.1 Goal
Reduce project setup time by 70% by providing standardized UI components, responsive layouts, automated testing boilerplate, and a robust offline-first data synchronization strategy.

### 1.2 Target Users
- **Novus Developers:** Speeding up the initial delivery cycle.
- **Client Admins:** Managing system configurations and users (via `admin` project).
- **End-Users:** Consuming public-facing services (via `user-app` project).

---

## 2. User Journey & Experience
### 2.1 First-Time Developer Setup
1. Clone the repository.
2. Run `npm install`.
3. Launch local Firebase Emulators.
4. Start `admin` (Port 4200) or `user-app` (Port 4400).
5. Result: A working splash screen followed by a login screen and dashboard.

### 2.2 Core User Flow: Initialization & Authentication
1. **Splash Screen:** On initial load, a splash/launch screen displays the Novus Apps logo while performing background checks (Auth state, Firestore cache sync, etc.).
2. **Landing Page:** User is directed to the Home page or the Login page based on authentication status.
3. **Authentication Interface:**
   - **Header:** A user icon in the top-right displays current status. Clicking opens a menu with "Login" or "Logout/Profile".
   - **Sidebar:** A dedicated "Login/Logout" item exists in the left navigation menu.
4. **Conditional Logic:** The UI dynamically toggles these options based on the **Firebase Auth Signal**.

---

## 3. Key Feature Requirements

### 3.1 UI & Design System (MANDATORY)
- **F01: Flexy Layout:** Sidebar (Left), Header (Top), Main Area.
- **F02: Hybrid Styling:**
  - Standard inputs and complex components (modals, selects) use **Material UI**.
  - Page layouts, spacing utilities, and custom components use **Tailwind CSS**.
- **F03: Responsive Breakpoints:**
  - Desktop: Sidebar fixed/expandable.
  - Tablet: Sidebar as a temporary overlay.
  - Smartphone: Sidebar as a modal; logo-heavy header.
- **F04: Splash Screen:** Integrated launch screen with a customizable loading indicator for initialization steps.

### 3.2 Backend & Data Service Layer
- **F05: Firebase Auth:** Support for email/password and authentication persistence.
- **F06: Firebase Firestore Collections:**
  - `users`: Stores basic profile information (UID, name, email, role).
  - `settings`: Stores global site configuration and lookups (theme, API endpoints, feature flags).
- **F07: Security Infrastructure:** Pre-defined `firestore.rules` file to enforce role-based access control.
- **F08: Two-Stage Store-and-Forward:**
  - Primary store: Browser LocalStorage.
  - Secondary store: Firebase Firestore.
- **F09: Firestore Offline Persistence:** Enable default caching to support PWA capabilities.
- **F13: Typed Firestore Data Layer:**
  - Every Firestore collection has a canonical model file (`*.model.ts`) exporting a typed interface, a `_schemaVersion` constant, a `deserializeXxx()` normalisation function, and a `serializeXxx()` null-sanitisation function.
  - **Null safety:** `serializeXxx()` guarantees no `null` fields reach Firestore (omit-not-null pattern for optional fields).
  - **Read normalisation:** `deserializeXxx()` fills safe defaults for any field missing from an older document.
  - **Schema versioning:** `_schemaVersion: number` is written on every save; `deserializeXxx()` applies lazy field migrations when it detects an older version — no batch Cloud Function migration required.
  - `StoreForwardService.set()` and `.sync()` accept optional `StoreForwardTransforms<T>` so model-specific logic stays with the model, not the service.

### 3.3 Initial Application Flows
- **F08: User App Launch Flow:**
  - Splash Screen -> Home Page -> Header (Login Icon) -> Profile Form (for basic user info).
- **F09: Admin App Launch Flow:**
  - Guarded Routes: Defaults to Login page if unauthenticated.
  - Auth Success -> Dashboard -> User Management (List/Edit) & Site Configuration (Theme/API settings).

### 3.4 DevOps & Quality Gate
- **F10: Playwright E2E:**
  - Automated login/logout sequences for both apps.
  - Viewport tests (Mobile/Tablet/Desktop).
  - **Flow-Specific Tests:** Verify Splash transition, Header icon toggle, and Route guarding for Admin.
- **F11: Firebase Emulators:** Local configuration for Auth, Firestore, and Functions.
- **F12: CI/CD Pipeline:** GitHub Actions to deploy to Firebase Hosting (Staging).

---

## 4. Acceptance Criteria (AC)

### AC1: Environment Setup
- [ ] Running `npm start` launches the application without manual configuration beyond environment variables.
- [ ] Firebase Emulators block local development from hitting production APIs.

### AC2: Backend & Database
- [ ] Firebase Authentication initializes correctly with email/password logic.
- [ ] Firestore contains initialized `users` and `settings` collections with mock data for local testing.
- [ ] `firestore.rules` is deployed and blocks unauthorized writes to restricted fields.
- [ ] The local emulator correctly persists these schemas between restarts.

### AC3: User Interface
- [ ] Initial bundle size for `user-app` remains under 500KB (initial load).
- [ ] Data entry while offline is visible locally and syncs automatically when the network returns.
- [ ] Playwright tests return "Green" on a headless Chrome environment.

---

## 5. Technology Constraints
- **Framework:** Angular 21 (Standalone Components, Signals).
- **Styling:** Material 21 + Tailwind 4+.
- **Database:** Firestore (NoSQL).
- **Test:** Playwright (E2E) + Jasmine/Karma (Unit).

---

*Authored by Jason (Product Manager)*
