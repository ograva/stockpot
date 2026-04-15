import { test, expect, type Page, type Browser } from '@playwright/test';

/**
 * T501: User Onboarding Flow
 *
 * Verifies that a newly registered user (no Firestore `users/{uid}.name` record)
 * is redirected through the onboarding flow and can complete their profile.
 *
 * Flow under test  (USR-503):
 *   Register → /dashboard/home (via register component) →
 *   navigate to /splash → splash detects no Firestore name →
 *   redirect to /dashboard/profile?onboarding=true →
 *   fill name + click "Get Started" → /dashboard/home
 *
 * The registration form sets Auth.displayName but does NOT create a
 * Firestore `users/{uid}` document. The SplashComponent checks Firestore,
 * finds no record, and sets needsOnboarding=true.
 *
 * Tests run in serial mode sharing one browser page to preserve auth
 * session state across sub-tests.
 */

// Unique credentials per test run to avoid emulator state collisions
const RUN_ID = Date.now();
const ONBOARDING_EMAIL = `onboarding-${RUN_ID}@test.com`;
const ONBOARDING_PASSWORD = 'password123';
const ONBOARDING_DISPLAY_NAME = `Onboarding User ${RUN_ID}`;

async function registerFreshUser(page: Page): Promise<void> {
  await page.goto('/authentication/register');
  await page.locator('[data-test-id="register-name-input"]').fill('New User'); // name is required by the form but not saved to Firestore
  await page
    .locator('[data-test-id="register-email-input"]')
    .fill(ONBOARDING_EMAIL);
  await page
    .locator('[data-test-id="register-password-input"]')
    .fill(ONBOARDING_PASSWORD);
  await page.locator('[data-test-id="register-submit-button"]').click();
  // Registration navigates directly to /dashboard/home
  await page.waitForURL(/dashboard\/home/, { timeout: 10000 });
}

// Tests share state (auth session) so must run serially in order
test.describe.configure({ mode: 'serial' });

let sharedPage: Page;
let sharedBrowser: Browser;

test.beforeAll(async ({ browser }) => {
  sharedBrowser = browser;
  sharedPage = await browser.newPage();

  // Register and then navigate to /splash to trigger the onboarding check
  await registerFreshUser(sharedPage);
  await sharedPage.goto('/splash', { waitUntil: 'domcontentloaded' });
  await sharedPage.waitForURL(/onboarding=true/, { timeout: 10000 });
});

test.afterAll(async () => {
  await sharedPage.context().clearCookies();
  await sharedPage.evaluate(() => localStorage.clear());
  await sharedPage.close();
});

test.describe('T501: User Onboarding Flow', () => {
  test('T501.1: new user is redirected to onboarding after splash', async () => {
    await expect(sharedPage).toHaveURL(/\/dashboard\/profile.*onboarding=true/);
  });

  test('T501.2: onboarding page shows "Complete your profile" heading', async () => {
    await expect(sharedPage.locator('mat-card-title')).toContainText(
      'Complete your profile',
    );
    await expect(sharedPage.locator('mat-card-subtitle')).toContainText(
      'Tell us a little about yourself',
    );
  });

  test('T501.3: onboarding-name-input and onboarding-submit-button are present', async () => {
    await expect(
      sharedPage.locator('[data-test-id="onboarding-name-input"]'),
    ).toBeVisible();
    await expect(
      sharedPage.locator('[data-test-id="onboarding-submit-button"]'),
    ).toBeVisible();
    // Profile-mode IDs must NOT be visible in onboarding mode
    await expect(
      sharedPage.locator('[data-test-id="profile-photo-url-input"]'),
    ).not.toBeVisible();
    await expect(
      sharedPage.locator('[data-test-id="profile-back-button"]'),
    ).not.toBeVisible();
  });

  test('T501.4: submitting empty display name shows validation error', async () => {
    await sharedPage.locator('[data-test-id="onboarding-name-input"]').clear();
    await sharedPage
      .locator('[data-test-id="onboarding-submit-button"]')
      .click();

    // markAllAsTouched() is called in save() on invalid submit, which causes @if
    // (touched && hasError) to render the mat-error element.
    await expect(
      sharedPage.locator('mat-error').filter({ hasText: 'Display name is required' }),
    ).toBeVisible({ timeout: 3000 });
    // Should NOT have navigated away
    await expect(sharedPage).toHaveURL(/onboarding=true/);
  });

  test('T501.5: completing onboarding navigates to /dashboard/home', async () => {
    await sharedPage
      .locator('[data-test-id="onboarding-name-input"]')
      .fill(ONBOARDING_DISPLAY_NAME);
    await sharedPage
      .locator('[data-test-id="onboarding-submit-button"]')
      .click();

    await sharedPage.waitForURL(/dashboard\/home/, { timeout: 10000 });
    await expect(sharedPage).toHaveURL(/dashboard\/home/);
    await expect(
      sharedPage.locator('[data-test-id="home-welcome-message"]'),
    ).toBeVisible();
    await expect(
      sharedPage.locator('[data-test-id="home-profile-cta"]'),
    ).toBeVisible();
  });

  test('T501.6: returning user (Firestore name set) is NOT redirected to onboarding', async () => {
    // Allow the background StoreForwardService Firestore write to complete
    await sharedPage.waitForTimeout(2000);

    // Navigate to splash as an authenticated user who now has a Firestore name
    await sharedPage.goto('/splash', { waitUntil: 'domcontentloaded' });

    // Must go to /dashboard/home — NOT to onboarding
    await sharedPage.waitForURL(/dashboard\/home/, { timeout: 10000 });
    await expect(sharedPage).toHaveURL(/dashboard\/home/);
    await expect(sharedPage).not.toHaveURL(/onboarding/);
  });
});
