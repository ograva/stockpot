/**
 * Playwright Global Setup
 *
 * Seeds the Firebase Auth emulator with a reusable test user before the
 * admin test suite runs. Only executes when TEST_ENV=local (default).
 *
 * Test credentials are exported so specs and helpers can import them
 * from a single source of truth rather than hardcoding strings everywhere.
 */

const TEST_ENV = process.env.TEST_ENV || 'local';
const AUTH_EMULATOR_URL = 'http://localhost:9098';
// Firebase emulators accept any non-empty string as the API key
const EMULATOR_API_KEY = 'test-api-key';

export const TEST_USER = {
  email: 'admin@test.com',
  password: 'password123',
};

export default async function globalSetup(): Promise<void> {
  if (TEST_ENV !== 'local') {
    console.log(`⏭  Skipping test user seed (TEST_ENV=${TEST_ENV})`);
    return;
  }

  try {
    const res = await fetch(
      `${AUTH_EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${EMULATOR_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER.email,
          password: TEST_USER.password,
          returnSecureToken: false,
        }),
      },
    );

    const body = await res.json();

    if (!res.ok) {
      // EMAIL_EXISTS is expected on re-runs — not an error
      if (body?.error?.message === 'EMAIL_EXISTS') {
        console.log(`✅ Test user already exists: ${TEST_USER.email}`);
        return;
      }
      throw new Error(
        `Failed to create test user: ${JSON.stringify(body.error)}`,
      );
    }

    console.log(`✅ Test user created: ${TEST_USER.email}`);
  } catch (err: any) {
    if (err.cause?.code === 'ECONNREFUSED') {
      console.warn(
        `⚠️  Firebase Auth emulator not reachable at ${AUTH_EMULATOR_URL}.\n` +
          `   Run "npm run firebase:emulators" before running E2E tests.\n` +
          `   Tests requiring authentication will fail.`,
      );
      // Don't throw — individual tests will fail with clearer messages
      return;
    }
    throw err;
  }
}
