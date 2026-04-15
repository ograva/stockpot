import { test, expect, type Page } from '@playwright/test';
import { loginAsTestUser } from '../../../helpers/auth.helper';

/**
 * T502: User Profile Form
 *
 * Verifies the profile page renders correctly, validates form inputs,
 * persists changes via StoreForwardService → Firestore, shows a success
 * snackbar, and reactively updates the header avatar/display name.
 *
 * Story: USR-502 — User Profile Form
 *
 * Prerequisites:
 * - Firebase Auth emulator running on port 9098
 * - Firestore emulator running on port 8085
 * - Test user seeded by global-setup.ts (admin@test.com / password123)
 */

const UPDATED_NAME = `Profile Test ${Date.now()}`;
const PHOTO_URL = 'https://example.com/avatar.png';

// Serial mode: tests share session state so the save in T502.4 is
// visible to T502.5 (header check).
test.describe.configure({ mode: 'serial' });

let sharedPage: Page;

test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();
  await loginAsTestUser(sharedPage);
  // Navigate to profile page
  await sharedPage.goto('/dashboard/profile');
  await expect(sharedPage.locator('[data-test-id="profile-page"]')).toBeVisible(
    { timeout: 10000 },
  );
});

test.afterAll(async () => {
  await sharedPage.context().clearCookies();
  await sharedPage.evaluate(() => localStorage.clear());
  await sharedPage.close();
});

test.describe('T502: User Profile Form', () => {
  test('T502.1: profile page renders with all expected elements', async () => {
    await expect(
      sharedPage.locator('[data-test-id="profile-page"]'),
    ).toBeVisible();
    await expect(
      sharedPage.locator('[data-test-id="profile-email-input"]'),
    ).toBeVisible();
    await expect(
      sharedPage.locator('[data-test-id="profile-role-badge"]'),
    ).toBeVisible();
    await expect(
      sharedPage.locator('[data-test-id="profile-form"]'),
    ).toBeVisible();
    await expect(
      sharedPage.locator('[data-test-id="profile-name-input"]'),
    ).toBeVisible();
    await expect(
      sharedPage.locator('[data-test-id="profile-photo-url-input"]'),
    ).toBeVisible();
    await expect(
      sharedPage.locator('[data-test-id="profile-save-button"]'),
    ).toBeVisible();
  });

  test('T502.2: email field is read-only', async () => {
    const emailInput = sharedPage.locator(
      '[data-test-id="profile-email-input"]',
    );
    await expect(emailInput).toBeVisible();
    const isReadonly =
      (await emailInput.getAttribute('readonly')) !== null ||
      (await emailInput.getAttribute('ng-reflect-readonly')) !== null ||
      (await emailInput.evaluate((el) => (el as HTMLInputElement).readOnly));
    expect(isReadonly).toBeTruthy();
  });

  test('T502.3: display name field accepts text input', async () => {
    await sharedPage.locator('[data-test-id="profile-name-input"]').clear();
    await sharedPage
      .locator('[data-test-id="profile-name-input"]')
      .fill('temp-name');
    await expect(
      sharedPage.locator('[data-test-id="profile-name-input"]'),
    ).toHaveValue('temp-name');
  });

  test('T502.4: submitting the form shows a success snackbar', async () => {
    // Fill final values for the save test
    await sharedPage
      .locator('[data-test-id="profile-name-input"]')
      .fill(UPDATED_NAME);
    await sharedPage
      .locator('[data-test-id="profile-photo-url-input"]')
      .fill(PHOTO_URL);

    await sharedPage.locator('[data-test-id="profile-save-button"]').click();

    // Success snackbar uses Angular Material's MatSnackBar (appears in a
    // mat-snack-bar-container rendered outside the main DOM tree)
    const snackbar = sharedPage.locator('mat-snack-bar-container');
    await expect(snackbar).toBeVisible({ timeout: 8000 });
    await expect(snackbar).toContainText('Profile saved');
  });

  test('T502.5: header reflects updated display name after save', async () => {
    // Allow AngularFire authState to propagate the updated user profile
    await sharedPage.waitForTimeout(1500);

    // Open the header profile menu to reveal the display name element
    await sharedPage.locator('[data-test-id="header-profile-button"]').click();

    await expect(
      sharedPage.locator('[data-test-id="header-profile-name"]'),
    ).toBeVisible({ timeout: 5000 });
    await expect(
      sharedPage.locator('[data-test-id="header-profile-name"]'),
    ).toContainText(UPDATED_NAME);

    // Close the menu
    await sharedPage.keyboard.press('Escape');
  });

  test('T502.6: back-to-home button navigates to /dashboard/home', async () => {
    await sharedPage.locator('[data-test-id="profile-back-button"]').click();
    await sharedPage.waitForURL(/dashboard\/home/, { timeout: 5000 });
    await expect(sharedPage).toHaveURL(/dashboard\/home/);
  });
});
