import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests',

  // Run tests sequentially (one at a time) to avoid race conditions on the live site
  fullyParallel: false,
  workers: 1,

  // No retries — each test case should capture the real first result for the Excel report
  retries: 0,

  // Timeout per test (ms) — 90s to cover slow translation API responses
  timeout: 90000,

  // Reporter: terminal output + HTML report
  reporter: [['list'], ['html', { outputFolder: 'test-results/html-report', open: 'never' }]],

  use: {
    // Target URL — all tests navigate here
    baseURL: 'https://www.pixelssuite.com/chat-translator',

    // Capture screenshot on failure for evidence
    screenshot: 'only-on-failure',

    // Video recording on failure
    video: 'retain-on-failure',

    // Slow down actions for visibility (ms)
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Output folder for test artifacts
  outputDir: 'test-results/artifacts',
});
