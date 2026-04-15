import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../../../helpers/auth.helper';

/**
 * T010: Admin Splash Screen Transition
 *
 * Verifies the splash screen renders correctly and routes to the right
 * destination based on authentication state.
 *
 * PRD F10 requirement: "Verify Splash transition"
 * Splash waits for both a 2-second minimum display AND auth state resolution
 * before navigating — allow up to 10 seconds for the full transition.
 */
test.describe('T010: Admin Splash Screen', () => {
  test('T010.1: splash screen renders all expected elements', async ({
    page,
  }) => {
    // Navigate directly to /splash before the auth check completes
    // Use waitUntil: 'commit' so we can assert before the redirect fires
    await page.goto('/splash', { waitUntil: 'domcontentloaded' });

    // Splash elements should be present immediately on render
    await expect(page.locator('[data-test-id="splash-screen"]')).toBeVisible();
    await expect(page.locator('[data-test-id="splash-logo"]')).toBeVisible();
    // The animated dots may be visibility:hidden during Tailwind's animate-bounce
    // cycle — check the element is in the DOM rather than visually visible.
    await expect(page.locator('[data-test-id="splash-loader"]')).toBeAttached();
  });

  test('T010.2: unauthenticated user is redirected to login after splash', async ({
    page,
  }) => {
    // Root navigates to /splash which then resolves auth state
    await page.goto('/');

    await page.waitForURL(/authentication\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/authentication\/login/);

    // Login form confirms correct landing page
    await expect(page.locator('[data-test-id="login-form"]')).toBeVisible();
  });

  test('T010.3: authenticated user is redirected to dashboard after splash', async ({
    page,
  }) => {
    // Log in first to establish an authenticated session
    await loginAsTestUser(page);

    // Navigate to splash — should detect existing session and go to dashboard
    await page.goto('/splash');

    await page.waitForURL(/dashboard\/home/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard\/home/);

    // Confirm the full authenticated layout is present
    await expect(
      page.locator('[data-test-id="header-app-title"]'),
    ).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });
});
