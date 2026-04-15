import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../../../helpers/auth.helper';

/**
 * T002: Admin Logout Flow
 *
 * Verifies that the sidebar Logout item correctly calls Firebase signOut,
 * redirects to the login page, and resets the auth-conditional nav items.
 *
 * Prerequisite: Firebase Auth emulator running with test user seeded
 * by global-setup.ts.
 */
test.describe('T002: Admin Logout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test fully authenticated at the dashboard
    await loginAsTestUser(page);
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('T002.1: sidebar shows Logout and hides Login when authenticated', async ({
    page,
  }) => {
    // Logout item must be visible for authenticated users
    await expect(
      page.locator('[data-test-id="sidebar-nav-logout"]'),
    ).toBeVisible();

    // Login item must be hidden for authenticated users
    await expect(
      page.locator('[data-test-id="sidebar-nav-login"]'),
    ).not.toBeVisible();
  });

  test('T002.2: clicking Logout redirects to login page', async ({ page }) => {
    await page.locator('[data-test-id="sidebar-nav-logout"]').click();

    // Firebase signOut + navigation completes within timeout
    await expect(page).toHaveURL(/authentication\/login/, { timeout: 8000 });

    // Login form confirms we are on the correct page
    await expect(page.locator('[data-test-id="login-form"]')).toBeVisible();
  });

  test('T002.3: protected routes redirect to login after logout', async ({
    page,
  }) => {
    await page.locator('[data-test-id="sidebar-nav-logout"]').click();
    await page.waitForURL(/authentication\/login/, { timeout: 8000 });

    // After logout, any protected route must redirect back to login.
    // The sidebar (with login/logout nav items) only exists in FullComponent
    // which requires auth — so the auth guard blocking access IS the proof
    // that the session was cleared and guest state is in effect.
    await page.goto('/dashboard/home');
    await expect(page).toHaveURL(/authentication\/login/);
    await expect(page.locator('[data-test-id="login-form"]')).toBeVisible();
  });
});
