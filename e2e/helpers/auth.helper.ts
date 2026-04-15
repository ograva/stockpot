import { Page } from '@playwright/test';
import { TEST_USER } from '../global-setup';

/**
 * Logs in as the standard E2E test user via the admin login UI.
 *
 * Requires:
 * - Firebase Auth emulator running on port 9098
 * - Test user seeded by global-setup.ts (runs automatically before the suite)
 *
 * After this call the page is at /dashboard/home and the FullComponent
 * layout (sidebar + header) is visible.
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  await page.goto('/authentication/login');
  await page
    .locator('[data-test-id="login-email-input"]')
    .fill(TEST_USER.email);
  await page
    .locator('[data-test-id="login-password-input"]')
    .fill(TEST_USER.password);
  await page.locator('[data-test-id="login-submit-button"]').click();
  await page.waitForURL(/dashboard/, { timeout: 10000 });
}
