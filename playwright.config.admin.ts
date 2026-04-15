import { defineConfig, devices } from '@playwright/test';

// Environment detection with production safety
const TEST_ENV = process.env.TEST_ENV || 'local';

if (TEST_ENV === 'production') {
  throw new Error(
    '❌ ERROR: E2E tests cannot run on production!\n' +
      'Set TEST_ENV to "local" or "staging" instead.\n' +
      'Example: TEST_ENV=local npm run test:e2e:admin',
  );
}

const BASE_URLS: Record<string, string> = {
  local: 'http://localhost:4200',
  staging: 'https://admin-staging.flexy-app.com', // Update with actual staging URL
};

const baseURL = BASE_URLS[TEST_ENV];

if (!baseURL) {
  throw new Error(
    `Invalid TEST_ENV: ${TEST_ENV}. Valid values: ${Object.keys(BASE_URLS).join(', ')}`,
  );
}

console.log(
  `🎭 Playwright Admin Tests - Environment: ${TEST_ENV}, Base URL: ${baseURL}`,
);

/**
 * Playwright configuration for Admin App E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e/admin',
  globalSetup: './e2e/global-setup.ts',

  // Test timeout
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/admin/html', open: 'never' }],
    ['json', { outputFile: 'test-results/admin/results.json' }],
    ['junit', { outputFile: 'test-results/admin/junit.xml' }],
  ],

  // Shared settings for all test projects
  use: {
    baseURL,

    // Capture trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Default viewport
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors (for local development)
    ignoreHTTPSErrors: true,

    // Browser context options
    contextOptions: {
      // Disable animations for more stable tests
      reducedMotion: 'reduce',
    },
  },

  // Configure test projects for different browsers
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

    // Tablet viewports
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Start dev server before tests (local environment only)
  webServer:
    TEST_ENV === 'local'
      ? {
          command: 'npm run start',
          url: 'http://localhost:4200',
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000,
          stdout: 'ignore',
          stderr: 'pipe',
        }
      : undefined,
});
