import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://localhost:3000', channel: 'chrome', viewport: { width: 1440, height: 1000 } },
  webServer: { command: 'npm run dev', url: 'http://localhost:3000/api/health', reuseExistingServer: true },
});
