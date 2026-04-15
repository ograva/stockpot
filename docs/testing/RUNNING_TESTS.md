# Running Playwright E2E Tests

This guide explains how to run the Playwright E2E test suite locally, in CI, and when debugging failures.

---

## Prerequisites

Before running any E2E test, three things must be running:

| What | Command | Port |
|------|---------|------|
| Firebase Emulators | `npm run firebase:emulators` | Auth: 9098, Firestore: 8085 |
| Admin App | `npm run start` | 4200 |
| User App | `npm run start:user` | 4400 |

**Shortcut — start everything at once:**

```bash
npm run dev
```

`npm run dev` uses `concurrently` to start the Admin app, User app, and Firebase emulators in one terminal with colour-coded output.

> ⚠️ Wait until you see `✔  All emulators ready!` in the terminal before running tests.

---

## Running the Tests

### Run all E2E tests (Admin + User app)

```bash
npm run test:e2e
```

This runs `test:e2e:admin` then `test:e2e:user` sequentially.

---

### Run Admin app tests only

```bash
npm run test:e2e:admin
```

Runs all specs under `e2e/admin/` using `playwright.config.admin.ts`.  
Base URL: `http://localhost:4200`

---

### Run User app tests only

```bash
npm run test:e2e:user
```

Runs all specs under `e2e/user-app/` using `playwright.config.user.ts`.  
Base URL: `http://localhost:4400`

---

### Run a single test file

```bash
# Admin app
npx playwright test e2e/admin/flows/authentication/T001-login.spec.ts --config=playwright.config.admin.ts

# User app
npx playwright test e2e/user-app/flows/onboarding/T501-onboarding.spec.ts --config=playwright.config.user.ts
```

---

### Run a specific test by name

```bash
npx playwright test --grep "T501.5" --config=playwright.config.user.ts
```

---

## Viewing Test Results

### Open the HTML report after a run

```bash
npm run test:e2e:report
```

Reports are saved to:
- Admin: `test-results/admin/html/`
- User: `test-results/user-app/html/`

---

## Debugging Failing Tests

### Interactive UI mode (recommended)

```bash
npm run test:e2e:ui
```

Opens Playwright's interactive browser UI. You can select individual tests, step through them, inspect the DOM, and view trace timelines. **Use this first when a test is failing.**

---

### Headed mode (watch the browser)

```bash
npm run test:e2e:headed
```

Runs tests in a visible browser window. Useful for watching what the test actually does.

---

### Debug mode (step-by-step with DevTools)

```bash
npm run test:e2e:debug
```

Pauses at each Playwright action. Opens Chromium with DevTools attached. Use `npx playwright test --debug` for a specific file.

---

### Trace viewer

When a test fails on CI (or locally with `retries > 0`), Playwright saves a trace file.  
Open it with:

```bash
npx playwright show-trace test-results/admin/html/trace.zip
```

The trace shows a full timeline: screenshots, network calls, console events, and DOM snapshots at every action.

---

## Test Environments

Tests are environment-aware. The `TEST_ENV` variable controls which base URL is used.

| `TEST_ENV` | Admin URL | User URL | When to use |
|------------|-----------|----------|-------------|
| `local` (default) | `http://localhost:4200` | `http://localhost:4400` | Local development with emulators |
| `staging` | Staging admin URL | Staging user URL | Pre-release validation |
| `production` | ❌ Blocked | ❌ Blocked | Never — throws an error |

```bash
# Run against staging
TEST_ENV=staging npm run test:e2e:admin
```

---

## Current Test Coverage

See [TEST_REGISTRY.md](TEST_REGISTRY.md) for the full list of tests and their status.

### Implemented specs (as of March 2026)

| File | Description | Stories |
|------|-------------|---------|
| `e2e/admin/flows/authentication/T001-login.spec.ts` | Admin login flow | AUT-201 |
| `e2e/admin/flows/authentication/T002-logout.spec.ts` | Admin logout flow | AUT-202 |
| `e2e/admin/flows/authentication/T003-register.spec.ts` | Admin registration | AUT-202 |
| `e2e/admin/flows/splash/T010-splash.spec.ts` | Admin splash transitions | AUT-201 |
| `e2e/admin/flows/settings/T040-app-settings.spec.ts` | Site settings Firestore read/write | ADM-403 |
| `e2e/user-app/flows/onboarding/T500-initial-load.spec.ts` | User app load + authenticated home page | USR-501 |
| `e2e/user-app/flows/onboarding/T501-onboarding.spec.ts` | New-user onboarding flow | USR-503 |
| `e2e/user-app/flows/profile/T502-profile-form.spec.ts` | User profile form save + header update | USR-502 |

---

## How the Test User is Seeded

The admin test suite uses a `globalSetup` script (`e2e/global-setup.ts`) that runs **once before the suite starts**. It calls the Firebase Auth emulator REST API to create `admin@test.com / password123` if it doesn't already exist.

The user app tests that need an authenticated user call the shared `loginAsTestUser()` helper from `e2e/helpers/auth.helper.ts`.

Tests that need a **fresh, new user** (e.g. T501 onboarding) generate a unique email address using `Date.now()` to avoid emulator state collisions between runs.

---

## CI/CD Integration

In CI, the test commands are the same. Set `TEST_ENV=local` and ensure the emulators are started before the test step:

```yaml
# Example GitHub Actions step
- name: Start Firebase Emulators
  run: npm run firebase:emulators &
  
- name: Wait for emulators
  run: npx wait-on http://localhost:8080

- name: Start Apps
  run: npm run start &  npm run start:user &
  
- name: Wait for apps
  run: npx wait-on http://localhost:4200 http://localhost:4400

- name: Run E2E Tests
  run: npm run test:e2e
  env:
    TEST_ENV: local
    CI: true
```

> `CI=true` enables: fail-fast on `test.only`, 2 retries per test, single worker (serial execution).

---

## What's Still Needed

The following high-priority test areas are **not yet implemented** — see [TEST_REGISTRY.md](TEST_REGISTRY.md) for the full backlog:

- **T010–T012** (Admin): Create, edit, delete users via the User Management UI (ADM-402/ADM-404)
- **T503** (User): User app login form validation
- **T020** (Admin): Dashboard overview rendering

Add new specs following the [WRITING_TESTS.md](WRITING_TESTS.md) guide and register them in [TEST_REGISTRY.md](TEST_REGISTRY.md).
