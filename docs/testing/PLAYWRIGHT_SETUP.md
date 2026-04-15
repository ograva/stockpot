# Playwright Setup and Configuration

This guide covers setting up and configuring Playwright for E2E testing in the Novus Flexy monorepo.

## Installation

Playwright is already installed in the project. If you need to reinstall:

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install

# Install system dependencies (Linux/Codespaces)
sudo npx playwright install-deps
```

## Project Configuration

### Admin App Configuration

**File**: `playwright.config.admin.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

// Environment detection with production safety
const TEST_ENV = process.env.TEST_ENV || 'local';

if (TEST_ENV === 'production') {
  throw new Error(
    '❌ ERROR: E2E tests cannot run on production!\n' +
    'Set TEST_ENV to "local" or "staging" instead.\n' +
    'Example: TEST_ENV=local npm run test:e2e:admin'
  );
}

const BASE_URLS = {
  local: 'http://localhost:4200',
  staging: 'https://admin-staging.example.com',
};

const baseURL = BASE_URLS[TEST_ENV as keyof typeof BASE_URLS];

if (!baseURL) {
  throw new Error(`Invalid TEST_ENV: ${TEST_ENV}. Use 'local' or 'staging'.`);
}

export default defineConfig({
  testDir: './e2e/admin',
  
  // Test timeout
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },

  // Run tests in parallel
  fullyParallel: true,
  
  // Fail fast on CI
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Limit parallel workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/admin/html' }],
    ['json', { outputFile: 'test-results/admin/results.json' }],
    ['junit', { outputFile: 'test-results/admin/junit.xml' }]
  ],
  
  // Shared settings
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Viewport
    viewport: { width: 1280, height: 720 },
  },

  // Test projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web server for local testing
  webServer: TEST_ENV === 'local' ? {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  } : undefined,
});
```

### User App Configuration

**File**: `playwright.config.user.ts`

Similar to admin config but with different port:

```typescript
import { defineConfig, devices } from '@playwright/test';

const TEST_ENV = process.env.TEST_ENV || 'local';

if (TEST_ENV === 'production') {
  throw new Error('E2E tests cannot run on production!');
}

const BASE_URLS = {
  local: 'http://localhost:4400',
  staging: 'https://user-staging.example.com',
};

export default defineConfig({
  testDir: './e2e/user-app',
  // ... similar configuration
  
  webServer: TEST_ENV === 'local' ? {
    command: 'npm run start:user',
    url: 'http://localhost:4400',
    reuseExistingServer: !process.env.CI,
  } : undefined,
});
```

## Running Tests

### Package Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test:e2e:admin": "playwright test --config=playwright.config.admin.ts",
    "test:e2e:user": "playwright test --config=playwright.config.user.ts",
    "test:e2e": "npm run test:e2e:admin && npm run test:e2e:user",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report"
  }
}
```

### Running Tests

```bash
# Run all admin E2E tests
npm run test:e2e:admin

# Run specific test file
npx playwright test e2e/admin/flows/authentication/T001-login.spec.ts

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug a specific test
npx playwright test --debug T001-login.spec.ts

# Run tests on specific browser
npx playwright test --project=firefox

# Run tests matching pattern
npx playwright test --grep "login"
```

### Environment Variables

```bash
# Local with emulators (default)
npm run test:e2e:admin

# Staging environment
TEST_ENV=staging npm run test:e2e:admin

# Production (will error)
TEST_ENV=production npm run test:e2e:admin  # ❌ Blocked!
```

## Test Structure

### File Organization

```
e2e/
├── admin/
│   ├── flows/
│   │   ├── authentication/
│   │   │   ├── T001-login.spec.ts
│   │   │   ├── T002-logout.spec.ts
│   │   │   └── T003-password-reset.spec.ts
│   │   ├── user-management/
│   │   │   └── T010-create-user.spec.ts
│   │   └── dashboard/
│   │       └── T020-view-dashboard.spec.ts
│   └── playwright.config.ts (symlink to root)
├── user-app/
│   └── flows/
│       └── onboarding/
│           └── T500-first-time-setup.spec.ts
└── shared/
    ├── fixtures/
    │   ├── users.json
    │   └── test-data.json
    ├── helpers/
    │   ├── auth-helper.ts
    │   └── firebase-helper.ts
    └── page-objects/
        ├── login-page.ts
        └── dashboard-page.ts
```

### Test File Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('T001: User Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to the page
    await page.goto('/auth/login');
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Clear cookies, logout, etc.
    await page.context().clearCookies();
  });

  test('T001.1: should login with valid credentials', async ({ page }) => {
    // Arrange
    const email = 'admin@test.com';
    const password = 'password123';

    // Act
    await page.locator('[data-test-id="email-input"]').fill(email);
    await page.locator('[data-test-id="password-input"]').fill(password);
    await page.locator('[data-test-id="login-submit-button"]').click();

    // Assert
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-test-id="user-menu"]')).toBeVisible();
  });

  test('T001.2: should show error for invalid credentials', async ({ page }) => {
    await page.locator('[data-test-id="email-input"]').fill('wrong@test.com');
    await page.locator('[data-test-id="password-input"]').fill('wrong');
    await page.locator('[data-test-id="login-submit-button"]').click();

    await expect(page.locator('[data-test-id="error-message"]')).toBeVisible();
    await expect(page.locator('[data-test-id="error-message"]'))
      .toContainText('Invalid credentials');
  });
});
```

## Page Object Pattern

### Benefits

- Encapsulate page interactions
- Reusable across tests
- Easier to maintain when UI changes

### Example Page Object

```typescript
// e2e/shared/page-objects/login-page.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-test-id="email-input"]');
    this.passwordInput = page.locator('[data-test-id="password-input"]');
    this.submitButton = page.locator('[data-test-id="login-submit-button"]');
    this.errorMessage = page.locator('[data-test-id="error-message"]');
  }

  async goto() {
    await this.page.goto('/auth/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}
```

### Using Page Objects

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../shared/page-objects/login-page';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login('admin@test.com', 'password123');
  
  await expect(page).toHaveURL('/dashboard');
});
```

## Fixtures and Test Data

### Creating Fixtures

```typescript
// e2e/shared/fixtures/test-fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';

type MyFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

export { expect } from '@playwright/test';
```

### Using Fixtures

```typescript
import { test, expect } from '../shared/fixtures/test-fixtures';

test('should login', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login('admin@test.com', 'password123');
  // ...
});
```

## Best Practices

### Selectors

✅ **DO**: Use `data-test-id` attributes
```typescript
await page.locator('[data-test-id="login-button"]').click();
```

❌ **DON'T**: Use CSS classes or IDs
```typescript
await page.locator('.login-btn').click(); // ❌ Classes change
await page.locator('#loginButton').click(); // ❌ IDs are for functionality
```

### Waits and Assertions

✅ **DO**: Use auto-waiting assertions
```typescript
await expect(page.locator('[data-test-id="message"]')).toBeVisible();
await expect(page.locator('[data-test-id="title"]')).toContainText('Welcome');
```

❌ **DON'T**: Use fixed timeouts
```typescript
await page.waitForTimeout(5000); // ❌ Flaky
```

### Test Independence

✅ **DO**: Make each test independent
```typescript
test.beforeEach(async ({ page }) => {
  // Fresh start for each test
  await page.context().clearCookies();
  await page.goto('/');
});
```

❌ **DON'T**: Depend on other tests
```typescript
test('login', async ({ page }) => { /* ... */ });
test('view profile', async ({ page }) => {
  // ❌ Assumes user is already logged in from previous test
});
```

## Debugging

### Debug Mode

```bash
# Run specific test in debug mode
npx playwright test --debug T001-login.spec.ts
```

### Screenshots and Videos

Automatically captured on failure (configured in playwright.config.ts):
```
test-results/
├── screenshots/
└── videos/
```

### Trace Viewer

```bash
# Open trace for failed test
npx playwright show-trace test-results/path-to-trace.zip
```

### Console Logs

```typescript
test('debug test', async ({ page }) => {
  // Listen to console messages
  page.on('console', msg => console.log('Browser log:', msg.text()));
  
  // Take screenshot
  await page.screenshot({ path: 'debug.png' });
  
  // Pause execution
  await page.pause();
});
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e
  env:
    TEST_ENV: local

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: test-results/
```

## Troubleshooting

### Browsers Not Found

```bash
npx playwright install
sudo npx playwright install-deps
```

### Tests Timing Out

- Increase timeout in config
- Check if server is running
- Verify Firebase emulators are running

### Element Not Found

- Check `data-test-id` spelling
- Ensure element is visible when test runs
- Use `await page.waitForSelector('[data-test-id="element"]')`

### Flaky Tests

- Use proper waits instead of timeouts
- Check for race conditions
- Ensure tests are independent

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Registry](TEST_REGISTRY.md)
- [Writing Tests Guide](WRITING_TESTS.md)

---

**Next Steps**: Check [TEST_REGISTRY.md](TEST_REGISTRY.md) for test numbering and [WRITING_TESTS.md](WRITING_TESTS.md) for writing guidelines.
