import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './src/tests',
  fullyParallel: false,
  timeout: 60000,
  // reporter: [['html', { open: 'never' }]],
  reporter: 'list',
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'ui',
      testDir: './src/tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api',
      testDir: './src/tests/api',
      use: { ...devices['Desktop Chrome'] },
    },

  ],
});
