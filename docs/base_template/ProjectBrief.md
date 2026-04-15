# Project Brief: Novus Flexy Template

| Information | Details |
| :--- | :--- |
| **Project Name** | Novus Flexy (The Novus Apps Foundation) |
| **Owner** | Novus Apps |
| **Architectural Style** | Angular 21 Monorepo |
| **Backend** | Firebase (Auth, Firestore, Cloud Functions) |

## 1. Executive Summary
Novus Flexy is the standardized internal template for all Novus Apps projects. It leverages the "Flexy" design system to provide a production-ready starting point that includes a functional Admin dashboard, a User-facing application, and a pre-configured Firebase backend. This template aims to reduce project initialization time by 70%.

## 2. Core Strategic Goals
- **Unified Branding:** Pre-integrated Novus Apps logo and standardized theming.
- **Development Velocity:** Modular components and pre-configured CI/CD (GitHub Actions) for immediate deployment.
- **Reliable Data Sync:** A robust offline-first architecture using a two-stage Store-and-Forward mechanism (LocalStorage -> Firestore).
- **Scalability:** A monorepo structure that allows for independent scaling of Admin and User applications while sharing critical business logic.

## 3. High-Level Architecture (Strategic View)
- **Frontend:** Angular 21 with Material UI (Signal-based state management).
- **Styling Pipeline:** Hybrid UI Strategy — **Material UI** for complex components + **Tailwind CSS** for layout, rapid styling, and bespoke design.
- **Layouts:** Left-navigation sidebar, top-header, and responsive main content area.
- **Responsiveness:** Dynamic UI that adapts to Desktop, Tablet, and Smartphone viewports.
- **Backend-as-a-Service (BaaS):** Firebase ecosystem for Authentication, Database, and Hosting.
- **DevEx:** Local emulation via Firebase Emulators to ensure a zero-cost, high-speed local development loop.

## 4. Feature Roadmap (The "Base" Build)
### Authentication
- [ ] Firebase Email/Password login.
- [ ] Persistent login state (Auto-login on refresh).
- [ ] Standardized Logout flow.

### Data Management
- [ ] Offline caching enabled in Firestore.
- [ ] LocalStorage synchronization for immediate UI feedback.
- [ ] Background sync to Firestore when connectivity is restored.

### Multiproject Setup
- **Admin App:** Feature-heavy, data-intensive management console.
- **User App:** Lean, mobile-optimized interface for end-users.

## 5. UI & Styling Strategy
- **Material UI (Foundation):** Use `Mat-` components for standardized behaviors (Dialogs, Datepickers, Autocomplete).
- **Tailwind CSS (Augmentation):** **Mandatory inclusion.** Use Tailwind for:
  - Flexbox/Grid layouts to reduce custom SCSS.
  - Spacing (margins/padding) and Typography.
  - Bespoke landing page components where Material's design language is too restrictive.
- **Theme Sync:** Ensure Tailwind's color palette imports primary/accent colors from the "Flexy" Material theme variables.

## 6. Quality & Reliability Strategy
- **Playwright E2E:** Automated testing for core user flows (Login, Data Entry, Navigation) across both applications.
- **Responsive Validation:** Automated testing on multiple viewports: Desktop, Tablet (iPad), and Smartphone (iPhone/Android).
- **Test-First Development:** Standardizing the use of `data-test-id` attributes to ensure UI changes don't break automated tests.
- **Visual Regression:** Future integration of snapshot testing to protect the "Flexy" design system integrity.

## 6. Modern Tech Considerations
- **Signal-First:** Minimize RxJS complexity in components by using Angular Signals for UI state.
- **AI-Friendly Codebase:** Centralized documentation in `docs/` and structured comments to aid AI coding assistants.
- **PWA-Ready:** The groundwork is laid for full Progressive Web App features (Service Workers).

## 7. Risk Assessment & Mitigation
- **Risk:** Template bloat in the User App. 
  - *Mitigation:* Aggressive tree-shaking and standalone component patterns to keep the User bundle minimal.
- **Risk:** Complex synchronization logic.
  - *Mitigation:* Centralized `DataShareService` with clear state transitions between Local and Cloud storage.
- **Risk:** Test Flakiness.
  - *Mitigation:* Careful use of Playwright's `locator` patterns and Firebase Emulators to ensure stable, repeatable test environments.

---

*Verified by Mary (Strategic Analyst)*
