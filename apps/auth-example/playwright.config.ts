import { defineConfig, devices } from '@playwright/test'

// Override with PLAYWRIGHT_PORT to run several checkouts (e.g. git worktrees) side by side.
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 4420)

/** Auth journeys through the built example: sign-up to sign-out, guards, expiry, tabs. */
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
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 860 } },
    },
  ],
  webServer: {
    command: `pnpm exec vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
})
