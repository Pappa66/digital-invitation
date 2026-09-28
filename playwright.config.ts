import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3100',
    channel: 'chrome',
    trace: 'off'
  },
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: {
    command: 'NEXT_PUBLIC_DEMO_MODE=true PORT=3100 npm run dev',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 120_000
  }
});
