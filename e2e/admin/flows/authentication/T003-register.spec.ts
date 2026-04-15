import { test, expect } from '@playwright/test';
import { TEST_USER } from '../../../global-setup';

/**
 * T003: Admin Registration Flow
 *
 * Tests the /authentication/register page: form display, validation,
 * duplicate-email error, successful registration, and navigation links.
 *
 * T003.4 (happy path) creates a unique user on each run — the emulator
 * resets between CI runs so stale users are never a concern.
 */
test.describe('T003: Admin Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/authentication/register');
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('T003.1: should display register page with all form elements', async ({
    page,
  }) => {
    await expect(page).toHaveTitle(/Novus App Template/);

    await expect(page.locator('[data-test-id="register-form"]')).toBeVisible();
    await expect(
      page.locator('[data-test-id="register-name-input"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-test-id="register-email-input"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-test-id="register-password-input"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-test-id="register-submit-button"]'),
    ).toBeVisible();
  });

  test('T003.2: should show validation errors for empty fields', async ({
    page,
  }) => {
    await page.locator('[data-test-id="register-submit-button"]').click();

    // Wait for Angular reactive form validation to run
    await page.waitForTimeout(500);

    const nameField = page.locator('[data-test-id="register-name-input"]');
    const emailField = page.locator('[data-test-id="register-email-input"]');

    const nameInvalid = await nameField.evaluate((el) =>
      el.classList.contains('ng-invalid'),
    );
    const emailInvalid = await emailField.evaluate((el) =>
      el.classList.contains('ng-invalid'),
    );

    expect(nameInvalid || emailInvalid).toBeTruthy();
  });

  test('T003.3: should show error for duplicate email', async ({ page }) => {
    // Use the pre-seeded test user — Firebase returns EMAIL_EXISTS
    await page
      .locator('[data-test-id="register-name-input"]')
      .fill('Duplicate User');
    await page
      .locator('[data-test-id="register-email-input"]')
      .fill(TEST_USER.email);
    await page
      .locator('[data-test-id="register-password-input"]')
      .fill('password123');
    await page.locator('[data-test-id="register-submit-button"]').click();

    await expect(
      page.locator('[data-test-id="register-error-message"]'),
    ).toBeVisible({ timeout: 8000 });
  });

  test('T003.4: should register with valid unique email and redirect to dashboard', async ({
    page,
  }) => {
    // Use a timestamp-unique address so this test is idempotent across runs
    const uniqueEmail = `e2e-user-${Date.now()}@example.com`;

    await page
      .locator('[data-test-id="register-name-input"]')
      .fill('E2E Test User');
    await page
      .locator('[data-test-id="register-email-input"]')
      .fill(uniqueEmail);
    await page
      .locator('[data-test-id="register-password-input"]')
      .fill('SecurePass1!');
    await page.locator('[data-test-id="register-submit-button"]').click();

    // Successful registration triggers the same dashboard redirect as login
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
    await expect(
      page.locator('[data-test-id="header-app-title"]'),
    ).toBeVisible();
  });

  test('T003.5: should navigate to login page via Sign In link', async ({
    page,
  }) => {
    await page.locator('[data-test-id="register-login-link"]').click();
    await expect(page).toHaveURL(/authentication\/login/);
    await expect(page.locator('[data-test-id="login-form"]')).toBeVisible();
  });
});
