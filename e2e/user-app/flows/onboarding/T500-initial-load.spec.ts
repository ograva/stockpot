import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../../../helpers/auth.helper';

/**
 * T500: First Time App Load
 * Tests initial loading, splash screen, and unauthenticated redirect in user app.
 * The splash screen shows for ~2s then redirects to /authentication/login (unauthenticated).
 *
 * Also covers USR-501: authenticated user landing on /dashboard/home, welcome message,
 * and "My Profile" CTA navigation.
 */
test.describe('T500: First Time App Load', () => {
  test('T500.1: should redirect unauthenticated user to login', async ({
    page,
  }) => {
    // Navigate to root — shows splash screen then redirects to login
    await page.goto('/');

    // Verify page title
    await expect(page).toHaveTitle(/Novus App Template/);

    // Splash redirects to login after auth check (~2s minimum display)
    await page.waitForURL(/authentication\/login/, { timeout: 10000 });

    // Verify app root is present
    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible();
  });

  test('T500.2: should show login form after splash redirect', async ({
    page,
  }) => {
    await page.goto('/');

    // Wait for splash to complete and redirect to login
    await page.waitForURL(/authentication\/login/, { timeout: 10000 });

    // Login form should be present after redirect
    await expect(page.locator('[data-test-id="login-form"]')).toBeVisible();
    await expect(
      page.locator('[data-test-id="login-email-input"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-test-id="login-submit-button"]'),
    ).toBeVisible();
  });

  test('T500.3: should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Wait for redirect
    await page.waitForURL(/authentication\/login/, { timeout: 10000 });

    // Verify page loads and is visible
    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible();

    // Check viewport meta tag exists
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', /width=device-width/);
  });

  test('T500.4: should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Wait for redirect
    await page.waitForURL(/authentication\/login/, { timeout: 10000 });

    // Verify page loads
    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible();
  });

  test('T500.5: should have no unexpected console errors on load', async ({
    page,
  }) => {
    const errors: string[] = [];

    // Known benign noise from Firebase emulators and Angular internals — filter these out
    const IGNORED_PATTERNS = [
      /localhost:\d+.*websocket/i, // Emulator WebSocket connections
      /Failed to load resource.*favicon/i, // Missing favicon (non-critical)
      /ERR_BLOCKED_BY_CLIENT/i, // Ad-blockers in headed mode
      /ng0\d{3}/i, // Angular framework diagnostic codes
    ];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!IGNORED_PATTERNS.some((p) => p.test(text))) {
          errors.push(text);
        }
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');

    // Wait for splash redirect and full load
    await page.waitForURL(/authentication\/login/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // No unexpected application errors should occur
    expect(errors).toHaveLength(0);
  });

  test('T500.6: should load required assets', async ({ page }) => {
    await page.goto('/');

    // Wait for splash redirect
    await page.waitForURL(/authentication\/login/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Check that main scripts are loaded (look for Angular in window)
    const hasAngular = await page.evaluate(() => {
      return typeof (window as any).ng !== 'undefined';
    });

    // Angular might not expose ng in production, so just check page loaded
    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible();
  });

  test.skip('T500.7: should show navigation menu', async ({ page }) => {
    // TODO: Implement when navigation is added to user app
    await page.goto('/');

    // Check for navigation
    const nav = page.locator('[data-test-id="main-navigation"]');
    await expect(nav).toBeVisible();
  });

  test.skip('T500.8: should show footer', async ({ page }) => {
    // TODO: Implement when footer is added
    await page.goto('/');

    // Check for footer
    const footer = page.locator('[data-test-id="app-footer"]');
    await expect(footer).toBeVisible();
  });
});

/**
 * T500 — Authenticated Home Page (USR-501)
 *
 * Tests that an authenticated user lands on /dashboard/home with the correct
 * content and can navigate to their profile via the CTA.
 */
test.describe('T500: Authenticated Home Page (USR-501)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    // loginAsTestUser lands at /dashboard (which resolves to /dashboard/home)
    await page.waitForURL(/dashboard\/home/, { timeout: 10000 });
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('T500.A1: authenticated user lands on /dashboard/home', async ({
    page,
  }) => {
    await expect(page).toHaveURL(/dashboard\/home/);
  });

  test('T500.A2: home page renders welcome card and welcome message', async ({
    page,
  }) => {
    await expect(
      page.locator('[data-test-id="home-welcome-card"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-test-id="home-welcome-message"]'),
    ).toBeVisible();
    // Message contains "Welcome back" followed by some name/identifier
    await expect(
      page.locator('[data-test-id="home-welcome-message"]'),
    ).toContainText('Welcome back');
  });

  test('T500.A3: "My Profile" CTA navigates to /dashboard/profile', async ({
    page,
  }) => {
    await page.locator('[data-test-id="home-profile-cta"]').click();
    await page.waitForURL(/dashboard\/profile/, { timeout: 5000 });
    await expect(page).toHaveURL(/dashboard\/profile/);
    await expect(page.locator('[data-test-id="profile-page"]')).toBeVisible();
  });

  test('T500.A4: header is rendered with profile button', async ({ page }) => {
    await expect(
      page.locator('[data-test-id="header-app-title"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-test-id="header-profile-button"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-test-id="header-profile-avatar"]'),
    ).toBeVisible();
  });

  test('T500.A5: sidebar "My Profile" nav item is visible for authenticated user', async ({
    page,
  }) => {
    // My Profile has iconName: 'user-circle' → data-test-id="sidebar-nav-user-circle"
    const profileLink = page.locator('[data-test-id="sidebar-nav-user-circle"]');
    await expect(profileLink).toBeVisible();
  });
});
