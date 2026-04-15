import { test, expect } from '@playwright/test';

/**
 * T001: User Login Flow
 * Tests admin user authentication with various scenarios
 */
test.describe('T001: User Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/authentication/login');
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Clear cookies and localStorage
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('T001.1: should display login page correctly', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Novus App Template/);

    // Verify login form elements are visible
    await expect(page.locator('[data-test-id="login-form"]')).toBeVisible();
    await expect(
      page.locator('[data-test-id="login-email-input"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-test-id="login-password-input"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-test-id="login-submit-button"]'),
    ).toBeVisible();

    // Verify optional elements
    // Note: Add data-test-id attributes to these elements in the component
    // await expect(page.locator('[data-test-id="login-title"]')).toContainText('Login');
    // await expect(page.locator('[data-test-id="login-register-link"]')).toBeVisible();
  });

  test('T001.2: should show validation errors for empty fields', async ({
    page,
  }) => {
    // Try to submit without filling fields
    await page.locator('[data-test-id="login-submit-button"]').click();

    // Wait for Angular reactive form validation to trigger
    await page.waitForTimeout(500);

    // Material form fields should be marked invalid after a submit attempt
    const emailField = page.locator('[data-test-id="login-email-input"]');
    const passwordField = page.locator('[data-test-id="login-password-input"]');

    const emailInvalid = await emailField.evaluate((el) =>
      el.classList.contains('ng-invalid'),
    );
    const passwordInvalid = await passwordField.evaluate((el) =>
      el.classList.contains('ng-invalid'),
    );

    expect(emailInvalid || passwordInvalid).toBeTruthy();
  });

  test('T001.3: should show error for invalid email format', async ({
    page,
  }) => {
    // Fill invalid email
    await page.locator('[data-test-id="login-email-input"]').fill('notanemail');
    await page
      .locator('[data-test-id="login-password-input"]')
      .fill('password123');
    await page.locator('[data-test-id="login-password-input"]').blur(); // Trigger validation

    // Wait for validation
    await page.waitForTimeout(500);

    // Check email field is invalid
    const emailField = page.locator('[data-test-id="login-email-input"]');
    const isInvalid = await emailField.evaluate(
      (el) =>
        el.classList.contains('ng-invalid') &&
        el.classList.contains('ng-touched'),
    );

    expect(isInvalid).toBeTruthy();
  });

  test('T001.4: should show error for invalid credentials', async ({
    page,
  }) => {
    // Fill with invalid credentials
    await page
      .locator('[data-test-id="login-email-input"]')
      .fill('wrong@example.com');
    await page
      .locator('[data-test-id="login-password-input"]')
      .fill('wrongpassword');
    await page.locator('[data-test-id="login-submit-button"]').click();

    // Wait for the error message to appear (avoids fixed timeouts)
    const errorMessage = page.locator('[data-test-id="login-error-message"]');
    await expect(errorMessage).toBeVisible({ timeout: 8000 });

    // Confirm we are still on the login page (not redirected to dashboard)
    await expect(page).toHaveURL(/authentication\/login/);
  });

  test('T001.5: should login successfully with valid credentials', async ({
    page,
  }) => {
    // Requires Firebase emulators running — test user seeded by global-setup.ts
    await page
      .locator('[data-test-id="login-email-input"]')
      .fill('admin@test.com');
    await page
      .locator('[data-test-id="login-password-input"]')
      .fill('password123');
    await page.locator('[data-test-id="login-submit-button"]').click();

    // Wait for redirect to dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);

    // Confirm the authenticated layout rendered
    await expect(
      page.locator('[data-test-id="header-app-title"]'),
    ).toBeVisible();
  });

  test.skip('T001.6: should remember me checkbox work correctly', async ({
    page,
  }) => {
    // TODO: Implement when "remember me" functionality exists

    // Check remember me checkbox
    await page.locator('[data-test-id="login-remember-checkbox"]').check();

    // Login with valid credentials
    await page
      .locator('[data-test-id="login-email-input"]')
      .fill('admin@test.com');
    await page
      .locator('[data-test-id="login-password-input"]')
      .fill('password123');
    await page.locator('[data-test-id="login-submit-button"]').click();

    // Wait for login
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    // Close and reopen browser
    await page.context().close();

    // Verify session persists (implementation depends on auth strategy)
  });

  test('T001.7: should navigate to registration page', async ({ page }) => {
    // Click on register link if it exists
    const registerLink = page.locator('[data-test-id="login-register-link"]');

    if ((await registerLink.count()) > 0) {
      await registerLink.click();
      await expect(page).toHaveURL(/authentication\/register/);
    } else {
      // Skip if register link doesn't exist yet
      test.skip();
    }
  });

  test('T001.8: should navigate to forgot password page', async ({ page }) => {
    // Click on forgot password link if it exists
    const forgotLink = page.locator(
      '[data-test-id="login-forgot-password-link"]',
    );

    if ((await forgotLink.count()) > 0) {
      await forgotLink.click();
      await expect(page).toHaveURL(/authentication\/forgot-password/);
    } else {
      // Skip if forgot password link doesn't exist yet
      test.skip();
    }
  });
});
