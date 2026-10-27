import { defineConfig, devices } from '@playwright/test';

/** Separate from the dev port so a running `npm run dev` never collides with e2e. */
const E2E_PORT = 5174;
const baseURL = `http://localhost:${E2E_PORT}`;

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0, // Flaky tests are investigated, never retried until green.
  reporter: [['list']],
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite --port ${E2E_PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
