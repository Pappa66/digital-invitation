import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:3100', trace: 'off' },
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: {
    command: 'NEXT_PUBLIC_DEMO_MODE=true npm run dev -- -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 180000
  }
});
