## ⚖️ Global Constraints (The "Golden Rules")
> [!IMPORTANT]
> All Shards must adhere to these rules. Poe will reject any code that violates them.
> 1. **Stack:** Node.js + TypeScript + ESM.
> 2. **AI-Ready:** Code must be highly modular for Agentic consumption.
> 3. **Privacy:** No hardcoded API keys; use `.env` and prioritize local-first logic.
> 4. **Standard:** Use `npm` for package management.

## Architecture
>  [!IMPORTANT] The primary technology stack will use the following
> Programming Language: Typescript, Javascript
> Framework: Angular @ Latest
> Cloud Services: Firebase
>   - data repository : firestore
>   - authentication
>   - storage
>   - functions
>   - security rules
> Primary Database (noSQL) : Firebase Firestore
> Secondary Database (RDBMS) : MySQL (only for system requiring to run in-premise)
> App preferences (in order): PWA, Android, iOS
> UI Components: Material UI 
> CSS/SCSS: Tailwind

## ⚡ Angular App Constraints (Cloud Tier)
> Rules apply to `projects/admin`, `projects/user-app`, `projects/vendor-app`.
> 1. **Framework:** Angular 21 Standalone Components only. No NgModules except `MaterialModule`.
> 2. **State:** Angular Signals only. No manually managed `BehaviorSubject` or `Subject` for shared state.
> 3. **Data Layer (DAT-302):** Every Firestore model must have `SCHEMA_VERSION` + `Doc` interface + `serialize()`/`deserialize()`. No `null` written to Firestore.
> 4. **Auth:** Firebase Auth via `onAuthStateChanged` registered once in `AppComponent`. All other layers read the `CoreService` signal.
> 5. **Shared Models:** Import all data models from `@stockpot/shared` (resolves to `projects/shared/src/models/`). Do NOT duplicate model definitions inside individual app `src/` folders.
> 6. **Styling:** Material 21 + Tailwind 4 hybrid. Material for complex behaviors; Tailwind for layout and spacing.
