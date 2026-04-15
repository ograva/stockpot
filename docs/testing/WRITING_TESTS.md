# Writing Effective E2E Tests

This guide provides best practices and patterns for writing maintainable, reliable E2E tests with Playwright.

## Table of Contents

- [Test Structure](#test-structure)
- [Selectors](#selectors)
- [Actions](#actions)
- [Assertions](#assertions)
- [Waits and Timeouts](#waits-and-timeouts)
- [Test Data](#test-data)
- [Page Objects](#page-objects)
- [Fixtures](#fixtures)
- [Error Handling](#error-handling)
- [Debugging](#debugging)
- [Common Patterns](#common-patterns)
- [Anti-Patterns](#anti-patterns)

---

## Test Structure

### Basic Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('T001: Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate, seed data, etc.
    await page.goto('/target-page');
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Clear cookies, reset state, etc.
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('T001.1: should perform expected action', async ({ page }) => {
    // Arrange
    const testData = { /* ... */ };

    // Act
    await page.locator('[data-test-id="action-button"]').click();

    // Assert
    await expect(page.locator('[data-test-id="result"]')).toBeVisible();
  });
});
```

### Arrange-Act-Assert Pattern

Always structure tests using AAA pattern:

```typescript
test('should create user successfully', async ({ page }) => {
  // Arrange: Set up test data and preconditions
  const userData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  };

  // Act: Perform the action being tested
  await page.locator('[data-test-id="user-firstname-input"]').fill(userData.firstName);
  await page.locator('[data-test-id="user-lastname-input"]').fill(userData.lastName);
  await page.locator('[data-test-id="user-email-input"]').fill(userData.email);
  await page.locator('[data-test-id="user-submit-button"]').click();

  // Assert: Verify expected outcomes
  await expect(page).toHaveURL(/users\/\d+/);
  await expect(page.locator('[data-test-id="success-message"]')).toBeVisible();
});
```

---

## Selectors

### Always Use data-test-id

✅ **GOOD**: Stable, semantic selectors
```typescript
await page.locator('[data-test-id="login-submit-button"]').click();
await page.locator('[data-test-id="user-email-input"]').fill('test@example.com');
await expect(page.locator('[data-test-id="error-message"]')).toBeVisible();
```

❌ **BAD**: Fragile selectors that break with styling changes
```typescript
await page.locator('.btn-primary').click();           // CSS class
await page.locator('#submitBtn').click();             // ID
await page.locator('button:nth-child(2)').click();    // Position
await page.locator('button:has-text("Submit")').click(); // Text
```

### Dynamic IDs

For lists and dynamic content:

```typescript
// With known ID
const userId = 123;
await page.locator(`[data-test-id="user-card-${userId}"]`).click();

// Select first item
await page.locator('[data-test-id="user-card"]').first().click();

// Select nth item
await page.locator('[data-test-id="user-card"]').nth(2).click();

// Loop through items
const cards = page.locator('[data-test-id^="user-card-"]');
const count = await cards.count();
for (let i = 0; i < count; i++) {
  const card = cards.nth(i);
  // Do something with card
}
```

### Chaining Selectors

Narrow down to specific elements:

```typescript
// Find button within specific modal
await page
  .locator('[data-test-id="confirm-modal"]')
  .locator('[data-test-id="confirm-button"]')
  .click();

// Find element with specific text
await page
  .locator('[data-test-id="user-card"]', { hasText: 'John Doe' })
  .locator('[data-test-id="edit-button"]')
  .click();
```

---

## Actions

### Clicking

```typescript
// Basic click
await page.locator('[data-test-id="button"]').click();

// Click with options
await page.locator('[data-test-id="button"]').click({
  button: 'right',    // Right click
  clickCount: 2,      // Double click
  force: true,        // Force click even if not visible
  modifiers: ['Ctrl'] // Click with Ctrl key
});

// Click and wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.locator('[data-test-id="link"]').click()
]);
```

### Typing

```typescript
// Fill input (clears first)
await page.locator('[data-test-id="input"]').fill('text');

// Type character by character
await page.locator('[data-test-id="input"]').type('text', { delay: 100 });

// Press specific keys
await page.locator('[data-test-id="input"]').press('Enter');
await page.locator('[data-test-id="input"]').press('Control+A');

// Clear input
await page.locator('[data-test-id="input"]').clear();
```

### Selecting

```typescript
// Select by value
await page.locator('[data-test-id="role-select"]').selectOption('admin');

// Select by label
await page.locator('[data-test-id="role-select"]').selectOption({ label: 'Administrator' });

// Select multiple
await page.locator('[data-test-id="tags-select"]').selectOption(['tag1', 'tag2']);
```

### Checking

```typescript
// Check checkbox
await page.locator('[data-test-id="terms-checkbox"]').check();

// Uncheck checkbox
await page.locator('[data-test-id="newsletter-checkbox"]').uncheck();

// Radio button
await page.locator('[data-test-id="gender-male-radio"]').check();
```

### Uploading Files

```typescript
// Upload single file
await page.locator('[data-test-id="file-input"]').setInputFiles('path/to/file.pdf');

// Upload multiple files
await page.locator('[data-test-id="files-input"]').setInputFiles([
  'path/to/file1.pdf',
  'path/to/file2.pdf'
]);

// Remove files
await page.locator('[data-test-id="file-input"]').setInputFiles([]);
```

### Hovering

```typescript
// Hover over element
await page.locator('[data-test-id="menu-item"]').hover();

// Hover and click
await page.locator('[data-test-id="dropdown-trigger"]').hover();
await page.locator('[data-test-id="dropdown-item"]').click();
```

### Scrolling

```typescript
// Scroll element into view
await page.locator('[data-test-id="footer"]').scrollIntoViewIfNeeded();

// Scroll to specific position
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

// Scroll within element
await page.locator('[data-test-id="scrollable-list"]').evaluate(el => {
  el.scrollTop = 500;
});
```

---

## Assertions

### Visibility

```typescript
// Element is visible
await expect(page.locator('[data-test-id="message"]')).toBeVisible();

// Element is hidden
await expect(page.locator('[data-test-id="loading"]')).toBeHidden();

// Element exists in DOM (may not be visible)
await expect(page.locator('[data-test-id="element"]')).toHaveCount(1);
```

### Text Content

```typescript
// Exact text match
await expect(page.locator('[data-test-id="title"]')).toHaveText('Welcome');

// Contains text
await expect(page.locator('[data-test-id="message"]')).toContainText('success');

// Regex match
await expect(page.locator('[data-test-id="count"]')).toHaveText(/\d+ users/);

// Empty text
await expect(page.locator('[data-test-id="error"]')).toBeEmpty();
```

### Attributes

```typescript
// Has attribute
await expect(page.locator('[data-test-id="link"]')).toHaveAttribute('href', '/home');

// Has class
await expect(page.locator('[data-test-id="button"]')).toHaveClass(/btn-primary/);

// Is enabled/disabled
await expect(page.locator('[data-test-id="submit"]')).toBeEnabled();
await expect(page.locator('[data-test-id="submit"]')).toBeDisabled();

// Is checked
await expect(page.locator('[data-test-id="checkbox"]')).toBeChecked();
await expect(page.locator('[data-test-id="checkbox"]')).not.toBeChecked();
```

### URL

```typescript
// Exact URL
await expect(page).toHaveURL('http://localhost:4200/dashboard');

// URL contains
await expect(page).toHaveURL(/dashboard/);

// URL matches regex
await expect(page).toHaveURL(/\/users\/\d+/);
```

### Count

```typescript
// Specific count
await expect(page.locator('[data-test-id="user-card"]')).toHaveCount(5);

// At least one
await expect(page.locator('[data-test-id="notification"]')).toHaveCount(
  expect.any(Number)
);

// Greater than
const count = await page.locator('[data-test-id="item"]').count();
expect(count).toBeGreaterThan(0);
```

### Values

```typescript
// Input value
await expect(page.locator('[data-test-id="email-input"]')).toHaveValue('test@example.com');

// Contains value
await expect(page.locator('[data-test-id="search-input"]')).toHaveValue(/test/);

// Selected option
await expect(page.locator('[data-test-id="role-select"]')).toHaveValue('admin');
```

---

## Waits and Timeouts

### Auto-Waiting

Playwright auto-waits for most actions:

```typescript
// These all auto-wait for element to be ready
await page.locator('[data-test-id="button"]').click();
await page.locator('[data-test-id="input"]').fill('text');
await expect(page.locator('[data-test-id="message"]')).toBeVisible();
```

### Explicit Waits

Use when auto-waiting isn't enough:

```typescript
// Wait for selector
await page.waitForSelector('[data-test-id="loaded"]');

// Wait for specific state
await page.waitForSelector('[data-test-id="button"]', {
  state: 'visible' | 'hidden' | 'attached' | 'detached'
});

// Wait for navigation
await page.waitForURL('**/dashboard');
await page.waitForNavigation({ url: '**/users' });

// Wait for load state
await page.waitForLoadState('networkidle');
await page.waitForLoadState('domcontentloaded');

// Wait for function
await page.waitForFunction(() => {
  return document.querySelector('[data-test-id="count"]')?.textContent === '5';
});

// Wait for response
const response = await page.waitForResponse(resp => 
  resp.url().includes('/api/users') && resp.status() === 200
);
```

### Custom Timeouts

```typescript
// Override default timeout
await expect(page.locator('[data-test-id="slow-element"]')).toBeVisible({
  timeout: 10000
});

// Wait for specific time (avoid when possible)
await page.waitForTimeout(1000); // Use sparingly!
```

---

## Test Data

### Inline Data

```typescript
test('should create user with valid data', async ({ page }) => {
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'admin'
  };
  
  await fillUserForm(page, user);
});
```

### Fixtures

```typescript
// e2e/shared/fixtures/users.json
{
  "admin": {
    "email": "admin@test.com",
    "password": "SecurePass123!",
    "role": "admin"
  },
  "regularUser": {
    "email": "user@test.com",
    "password": "UserPass123!",
    "role": "user"
  }
}

// In test file
import testUsers from '../shared/fixtures/users.json';

test('admin login', async ({ page }) => {
  const admin = testUsers.admin;
  await loginPage.login(admin.email, admin.password);
});
```

### Generated Data

```typescript
import { faker } from '@faker-js/faker'; // Optional: install if needed

test('should create user with random data', async ({ page }) => {
  const user = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
  };
  
  // Use generated data
});
```

---

## Page Objects

### Basic Page Object

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
    this.emailInput = page.locator('[data-test-id="login-email-input"]');
    this.passwordInput = page.locator('[data-test-id="login-password-input"]');
    this.submitButton = page.locator('[data-test-id="login-submit-button"]');
    this.errorMessage = page.locator('[data-test-id="login-error-message"]');
  }

  async goto() {
    await this.page.goto('/authentication/side-login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  async isErrorVisible() {
    return await this.errorMessage.isVisible();
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
  
  await expect(page).toHaveURL(/dashboard/);
});

test('should show error for invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login('wrong@test.com', 'wrong');
  
  await expect(loginPage.errorMessage).toBeVisible();
  expect(await loginPage.getErrorMessage()).toContain('Invalid');
});
```

---

## Fixtures

### Custom Fixtures

```typescript
// e2e/shared/fixtures/test-fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';
import { DashboardPage } from '../page-objects/dashboard-page';

type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page; // Page with user already logged in
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  authenticatedPage: async ({ page }, use) => {
    // Login before each test
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@test.com', 'password123');
    await page.waitForURL('**/dashboard');
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

### Using Custom Fixtures

```typescript
import { test, expect } from '../shared/fixtures/test-fixtures';

// Automatically get page objects
test('should navigate using page objects', async ({ loginPage, dashboardPage }) => {
  await loginPage.goto();
  await loginPage.login('admin@test.com', 'password123');
  
  await dashboardPage.verifyLoaded();
});

// Use authenticated page fixture
test('should access protected route', async ({ authenticatedPage }) => {
  // Already logged in!
  await authenticatedPage.goto('/admin/users');
  await expect(authenticatedPage.locator('[data-test-id="user-list"]')).toBeVisible();
});
```

---

## Error Handling

### Handling Expected Errors

```typescript
test('should handle network error gracefully', async ({ page }) => {
  // Simulate network failure
  await page.route('**/api/users', route => route.abort());
  
  await page.goto('/users');
  
  // Verify error message
  await expect(page.locator('[data-test-id="error-message"]')).toBeVisible();
  await expect(page.locator('[data-test-id="error-message"]'))
    .toContainText('Failed to load');
});
```

### Try-Catch for Cleanup

```typescript
test('should cleanup after error', async ({ page }) => {
  try {
    await page.goto('/users');
    await page.locator('[data-test-id="create-button"]').click();
    // Test actions...
  } finally {
    // Cleanup runs even if test fails
    await page.context().clearCookies();
  }
});
```

### Conditional Assertions

```typescript
test('should handle optional elements', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Check if element exists before asserting
  const banner = page.locator('[data-test-id="promo-banner"]');
  if (await banner.count() > 0) {
    await expect(banner).toBeVisible();
  }
});
```

---

## Debugging

### Debug Mode

```bash
# Run test in debug mode
npx playwright test --debug T001-login.spec.ts

# Debug from specific line
npx playwright test --debug --headed
```

### Pause Execution

```typescript
test('debug test', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Pause here - browser stays open
  await page.pause();
  
  // Continue execution after inspecting
  await page.locator('[data-test-id="button"]').click();
});
```

### Screenshots

```typescript
test('take screenshot for debugging', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Take screenshot
  await page.screenshot({ path: 'debug-screenshot.png' });
  
  // Screenshot specific element
  await page.locator('[data-test-id="chart"]').screenshot({ 
    path: 'chart-screenshot.png' 
  });
});
```

### Console Logs

```typescript
test('capture console logs', async ({ page }) => {
  const messages: string[] = [];
  
  // Listen to console
  page.on('console', msg => {
    console.log(`Browser ${msg.type()}: ${msg.text()}`);
    messages.push(msg.text());
  });
  
  await page.goto('/dashboard');
  
  // Check logs
  console.log('All messages:', messages);
});
```

### Trace Viewer

```bash
# Tests automatically capture trace on failure
# View trace after test
npx playwright show-trace test-results/.../trace.zip
```

---

## Common Patterns

### Login Helper

```typescript
async function login(page: Page, email: string, password: string) {
  await page.locator('[data-test-id="login-email-input"]').fill(email);
  await page.locator('[data-test-id="login-password-input"]').fill(password);
  await page.locator('[data-test-id="login-submit-button"]').click();
  await page.waitForURL('**/dashboard');
}

test('access protected route', async ({ page }) => {
  await page.goto('/authentication/side-login');
  await login(page, 'admin@test.com', 'password123');
  
  await page.goto('/admin/users');
  await expect(page.locator('[data-test-id="user-list"]')).toBeVisible();
});
```

### Form Filling

```typescript
async function fillUserForm(page: Page, user: any) {
  await page.locator('[data-test-id="user-firstname-input"]').fill(user.firstName);
  await page.locator('[data-test-id="user-lastname-input"]').fill(user.lastName);
  await page.locator('[data-test-id="user-email-input"]').fill(user.email);
  await page.locator('[data-test-id="user-role-select"]').selectOption(user.role);
}

test('create user', async ({ page }) => {
  await page.goto('/admin/users/create');
  
  await fillUserForm(page, {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    role: 'admin'
  });
  
  await page.locator('[data-test-id="user-submit-button"]').click();
});
```

### Modal Interaction

```typescript
async function openModalAndConfirm(page: Page, modalTestId: string) {
  // Wait for modal to appear
  const modal = page.locator(`[data-test-id="${modalTestId}"]`);
  await expect(modal).toBeVisible();
  
  // Click confirm
  await modal.locator('[data-test-id="confirm-button"]').click();
  
  // Wait for modal to close
  await expect(modal).toBeHidden();
}

test('delete with confirmation', async ({ page }) => {
  await page.goto('/admin/users');
  await page.locator('[data-test-id="user-delete-button-1"]').click();
  
  await openModalAndConfirm(page, 'confirm-delete-modal');
  
  await expect(page.locator('[data-test-id="success-message"]')).toBeVisible();
});
```

---

## Anti-Patterns

### ❌ Don't Use Fixed Timeouts

```typescript
// ❌ BAD
await page.waitForTimeout(5000);
await page.locator('[data-test-id="element"]').click();

// ✅ GOOD - Use auto-waiting
await page.locator('[data-test-id="element"]').click();

// ✅ GOOD - Wait for specific condition
await page.waitForSelector('[data-test-id="element"]', { state: 'visible' });
```

### ❌ Don't Use Fragile Selectors

```typescript
// ❌ BAD - CSS classes and text
await page.locator('.btn-primary').click();
await page.locator('button:has-text("Submit")').click();

// ✅ GOOD - data-test-id
await page.locator('[data-test-id="submit-button"]').click();
```

### ❌ Don't Make Tests Depend on Each Other

```typescript
// ❌ BAD - Test 2 depends on Test 1
test('create user', async ({ page }) => {
  // Creates user with ID 1
});

test('edit user', async ({ page }) => {
  // Assumes user 1 exists from previous test
  await page.goto('/users/1/edit');
});

// ✅ GOOD - Each test is independent
test('edit user', async ({ page }) => {
  // Create user first
  const userId = await createTestUser();
  await page.goto(`/users/${userId}/edit`);
});
```

### ❌ Don't Test Implementation Details

```typescript
// ❌ BAD - Testing Angular internals
test('component has correct state', async ({ page }) => {
  const state = await page.evaluate(() => {
    const component = (window as any).ng.getComponent(element);
    return component.someInternalProperty;
  });
  expect(state).toBe(true);
});

// ✅ GOOD - Test user-visible behavior
test('form shows success message', async ({ page }) => {
  await page.locator('[data-test-id="submit-button"]').click();
  await expect(page.locator('[data-test-id="success-message"]')).toBeVisible();
});
```

### ❌ Don't Over-Mock

```typescript
// ❌ BAD - Mocking everything
await page.route('**/*', route => route.fulfill({ status: 200 }));

// ✅ GOOD - Mock only what's necessary
await page.route('**/api/external-service/**', route => 
  route.fulfill({ status: 200, body: JSON.stringify({ data: 'mock' }) })
);
```

---

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Registry](TEST_REGISTRY.md)
- [Data Test IDs](DATA_TEST_IDS.md)
- [Testing Strategy](TESTING_STRATEGY.md)

---

**Next Steps**: Start writing tests following these patterns and refer back to this guide as needed!
