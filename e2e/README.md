# E2E Test Organization

This directory contains E2E tests organized by **user flows** rather than technical structure.

## Philosophy

Tests are organized around **what users do**, not how the application is structured technically. This makes tests:
- Easier to understand from a business perspective
- More maintainable when code structure changes
- Better aligned with user stories and acceptance criteria

## Structure

```
e2e/
├── admin/                          # Admin application tests
│   └── flows/                      # Organized by user flows
│       ├── authentication/         # Login, logout, password reset
│       │   ├── T001-login.spec.ts
│       │   ├── T002-logout.spec.ts
│       │   └── T003-password-reset.spec.ts
│       ├── user-management/        # User CRUD operations
│       │   ├── T010-create-user.spec.ts
│       │   ├── T011-edit-user.spec.ts
│       │   └── T012-delete-user.spec.ts
│       ├── dashboard/              # Dashboard and analytics
│       │   ├── T020-dashboard-overview.spec.ts
│       │   └── T021-sales-overview.spec.ts
│       ├── content/                # Content management
│       │   ├── T030-create-blog.spec.ts
│       │   └── T031-edit-blog.spec.ts
│       ├── settings/               # Application settings
│       │   └── T040-app-settings.spec.ts
│       └── errors/                 # Error handling
│           ├── T900-not-found.spec.ts
│           └── T901-network-errors.spec.ts
├── user-app/                       # User application tests
│   └── flows/
│       ├── onboarding/             # First-time user experience
│       │   ├── T500-initial-load.spec.ts
│       │   └── T501-onboarding.spec.ts
│       ├── authentication/         # User login/registration
│       │   ├── T502-user-registration.spec.ts
│       │   └── T503-user-login.spec.ts
│       └── navigation/             # Navigation and UI
│           └── T600-navigation-menu.spec.ts
└── shared/                         # Shared test utilities
    ├── fixtures/                   # Test data
    │   ├── users.json
    │   └── test-data.json
    ├── helpers/                    # Helper functions
    │   ├── auth-helper.ts
    │   └── firebase-helper.ts
    └── page-objects/               # Page object models
        ├── login-page.ts
        └── dashboard-page.ts
```

## Test Numbering

Tests follow a structured numbering system (see [TEST_REGISTRY.md](../docs/testing/TEST_REGISTRY.md)):

| Range | Category |
|-------|----------|
| T000-T099 | Authentication & Authorization |
| T100-T199 | User Management |
| T200-T299 | Dashboard & Analytics |
| T300-T399 | Content Management |
| T400-T499 | Settings & Configuration |
| T500-T599 | User App Flows |
| T600-T699 | Notifications |
| T700-T799 | Search & Filtering |
| T800-T899 | Integration & API |
| T900-T999 | Edge Cases & Error Handling |

### Sub-test Numbering

Each test can have multiple sub-tests using dot notation:
- `T001.1` - First scenario in T001
- `T001.2` - Second scenario in T001
- etc.

## Running Tests

```bash
# Run all admin tests
npm run test:e2e:admin

# Run all user app tests
npm run test:e2e:user

# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/admin/flows/authentication/T001-login.spec.ts

# Run tests in specific flow
npx playwright test e2e/admin/flows/authentication/

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug a specific test
npx playwright test --debug T001-login.spec.ts
```

## Writing Tests

### File Structure

Each test file should follow this structure:

```typescript
import { test, expect } from '@playwright/test';

/**
 * T001: User Login Flow
 * Brief description of what this test covers
 */
test.describe('T001: User Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/authentication/side-login');
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
    await page.context().clearCookies();
  });

  test('T001.1: should login with valid credentials', async ({ page }) => {
    // Test implementation
  });

  test('T001.2: should show error with invalid credentials', async ({ page }) => {
    // Test implementation
  });
});
```

### Test Naming

- **File names**: `T{number}-{flow-name}.spec.ts` (e.g., `T001-login.spec.ts`)
- **Describe blocks**: `T{number}: {Title}` (e.g., `T001: User Login Flow`)
- **Test cases**: `T{number}.{sub}: should {action}` (e.g., `T001.1: should login successfully`)

### Using data-test-id Attributes

Always use `data-test-id` attributes for selecting elements:

```typescript
// ✅ GOOD: Stable selector
await page.locator('[data-test-id="login-submit-button"]').click();

// ❌ BAD: Fragile selectors
await page.locator('.login-btn').click();
await page.locator('#loginButton').click();
await page.locator('button:has-text("Login")').click();
```

## Shared Resources

### Fixtures

Store test data in `shared/fixtures/`:
```typescript
// users.json
{
  "admin": {
    "email": "admin@test.com",
    "password": "password123",
    "role": "admin"
  }
}
```

### Helpers

Create reusable helper functions in `shared/helpers/`:
```typescript
// auth-helper.ts
export async function login(page: Page, email: string, password: string) {
  await page.locator('[data-test-id="login-email-input"]').fill(email);
  await page.locator('[data-test-id="login-password-input"]').fill(password);
  await page.locator('[data-test-id="login-submit-button"]').click();
}
```

### Page Objects

Encapsulate page interactions in `shared/page-objects/`:
```typescript
// login-page.ts
export class LoginPage {
  constructor(private page: Page) {}
  
  async login(email: string, password: string) {
    await this.page.locator('[data-test-id="login-email-input"]').fill(email);
    await this.page.locator('[data-test-id="login-password-input"]').fill(password);
    await this.page.locator('[data-test-id="login-submit-button"]').click();
  }
}
```

## Best Practices

1. **Independent Tests**: Each test should be independent and not rely on other tests
2. **Clean State**: Use `beforeEach` and `afterEach` to ensure clean state
3. **Descriptive Names**: Test names should clearly describe what they test
4. **Use data-test-id**: Always use data-test-id attributes for selectors
5. **Avoid Timeouts**: Use Playwright's auto-waiting instead of fixed timeouts
6. **Group Related Tests**: Use `test.describe` to group related test scenarios
7. **Skip When Needed**: Use `test.skip()` for tests that require setup not yet complete

## Environment Safety

Tests are configured to **never run on production**:

```bash
# ✅ OK: Local testing
npm run test:e2e:admin

# ✅ OK: Staging testing
TEST_ENV=staging npm run test:e2e:admin

# ❌ BLOCKED: Production testing
TEST_ENV=production npm run test:e2e:admin  # Will throw error!
```

## Documentation

For comprehensive testing documentation, see:
- [Testing Strategy](../docs/testing/TESTING_STRATEGY.md)
- [Playwright Setup](../docs/testing/PLAYWRIGHT_SETUP.md)
- [Test Registry](../docs/testing/TEST_REGISTRY.md)
- [Data Test IDs](../docs/testing/DATA_TEST_IDS.md)
- [Writing Tests](../docs/testing/WRITING_TESTS.md)

---

**Last Updated**: 2024-01-XX
