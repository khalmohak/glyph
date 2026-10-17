import { defineConfig, devices } from '@playwright/test'

const PORT = 4410

/** User journeys through the built demo app: the same flows a real Glyph app needs. */
export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.results',
  fullyParallel: true,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'e2e/.report' }]]
    : [['list']],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  expect: { timeout: 10_000 },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1360, height: 900 } },
      testIgnore: 'mobile.spec.ts',
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: 'mobile.spec.ts' },
  ],
  webServer: {
    command: `pnpm exec vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
})
