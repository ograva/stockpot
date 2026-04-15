# Running the Monorepo Locally

This guide explains how to run all three processes in this workspace — the Admin app, the User app,
and the Firebase Emulators — covering what order to start them in, when to run each, and how they relate to each other.

---

## The Three Processes

| Process            | Script                       | Port                              | What it does                                       |
| :----------------- | :--------------------------- | :-------------------------------- | :------------------------------------------------- |
| Firebase Emulators | `npm run firebase:emulators` | 8080 (UI), 9099, 8085, 5001, 9199 | Local backend: Auth, Firestore, Functions, Storage |
| Admin Angular App  | `npm run start`              | 4200                              | Admin dashboard SPA                                |
| User Angular App   | `npm run start:user`         | 4400                              | End-user facing SPA                                |

Both Angular apps are configured to point at the emulators via `environments/environment.local.ts`.
They do **not** connect to any real Firebase project during local development.

---

## Scenario 1 — Full local development (all three at once)

This is the standard daily workflow. Start everything with a single command:

```bash
npm run dev
```

This runs `admin`, `user-app`, and `firebase emulators` concurrently with color-coded terminal output
(cyan = admin, green = user-app, yellow = firebase).

**Order if starting manually:**

```bash
# Terminal 1 — start emulators first so the apps connect immediately on load
npm run firebase:emulators

# Terminal 2 — admin app
npm run start

# Terminal 3 — user-app
npm run start:user
```

> **Why emulators first?** The Angular apps call `connectAuthEmulator()` and `connectFirestoreEmulator()`
> during bootstrap. If the emulators aren't running, Auth and Firestore calls will fail silently or
> throw CORS errors in the browser console. Starting emulators first avoids a confusing browser reload.

Access:

- Admin app → http://localhost:4200
- User app → http://localhost:4400
- Emulator UI → http://localhost:8080

---

## Scenario 2 — Frontend only (no Firebase features needed)

For pure UI/layout work on components that don't touch Firebase:

```bash
npm run start        # admin only
npm run start:user   # user-app only
npm run start:all    # both Angular apps, no emulators
```

Auth-dependent components will show a loading state or redirect to login, but the apps will render.
No backend errors will crash the build.

---

## Scenario 3 — Emulators only (no Angular dev server)

Useful when running Playwright E2E tests, seeding data, or testing Cloud Functions independently:

```bash
npm run firebase:emulators
```

Then in a separate terminal, run Playwright against the already-running emulators:

```bash
npm run test:e2e:admin   # requires admin app also running on 4200
npm run test:e2e:user    # requires user-app also running on 4400
```

For E2E testing, all three processes **must** be running. The recommended approach:

```bash
# Terminal 1
npm run dev

# Terminal 2 (once apps are ready)
npm run test:e2e
```

---

## Scenario 4 — Cloud Functions development

The `functions/` folder is a separate Node.js project. When you change function code:

```bash
# From the workspace root — emulators pick up TypeScript changes automatically
npm run firebase:emulators

# Or rebuild functions explicitly (from functions/ dir)
cd functions && npm run build:watch
```

The emulator watches `functions/lib/` (the compiled output). Running `build:watch` ensures
changes to `functions/src/*.ts` are compiled and reloaded automatically.

---

## Scenario 5 — Production build check

To verify the production bundle before deploying:

```bash
npm run build          # builds both admin and user-app for production
```

Output goes to `dist/admin/browser/` and `dist/user-app/browser/`.
These are the directories referenced by `firebase.json` for hosting deployment.

---

## Startup Checklist (for AI agents and new developers)

Before assuming something is broken, verify:

- [ ] `npm install` has been run from the workspace root (`/workspaces/novus-flexy`)
- [ ] `cd functions && npm install` has been run (separate dependency tree)
- [ ] Emulators are running before testing any Auth or Firestore feature
- [ ] The correct environment file is being used — local dev always uses `environment.local.ts`
- [ ] Port 4200, 4400, and 8080 are forwarded if working in GitHub Codespaces

---

## Port Reference

| Port | Service              | Used by             |
| :--- | :------------------- | :------------------ |
| 4200 | Admin Angular app    | Browser, Playwright |
| 4400 | User Angular app     | Browser, Playwright |
| 8080 | Firebase Emulator UI | Browser             |
| 8085 | Firestore Emulator   | Both Angular apps   |
| 9099 | Auth Emulator        | Both Angular apps   |
| 5001 | Functions Emulator   | Both Angular apps   |
| 9199 | Storage Emulator     | Both Angular apps   |

---

## Related docs

- [FIREBASE_EMULATORS.md](./FIREBASE_EMULATORS.md) — detailed emulator configuration and data management
- [GETTING_STARTED.md](./GETTING_STARTED.md) — initial project setup
- [DEVCONTAINER.md](./DEVCONTAINER.md) — GitHub Codespaces / VS Code container setup
