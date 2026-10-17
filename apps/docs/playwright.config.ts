import { defineConfig, devices } from '@playwright/test'

// Override with PLAYWRIGHT_PORT to run several checkouts (e.g. git worktrees) side by side.
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 4400)
const isLinux = process.platform === 'linux'

/**
 * End-to-end tests against the built docs site: accessibility, visual regression and
 * interactions. Visual baselines are Linux-only (rendered in the Playwright Docker image),
 * so on macOS/Windows the visual project is skipped. Run `pnpm e2e:update` to refresh them.
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.results',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}-{platform}{ext}',
  fullyParallel: true,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'e2e/.report' }]]
    : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    reducedMotion: 'reduce',
  },
  expect: {
    // Lazy example chunks and stable-screenshot retries need headroom on a busy machine.
    timeout: 15_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled', caret: 'hide' },
  },
  projects: [
    {
      name: 'a11y',
      testMatch: /(^|\/)(a11y|component-page-a11y)\.spec\.ts$/,
      // axe on a full docs page takes a few seconds, more on a busy machine.
      timeout: 120_000,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'interactions',
      testMatch: /(^|\/)(interactions|component-page|guides)\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Exploratory sweep over every route × preset × mode × viewport. Opt-in: GLYPH_QA=1.
      name: 'qa',
      testMatch: 'qa.spec.ts',
      grep: process.env.GLYPH_QA === '1' ? undefined : /$^/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'visual',
      testMatch: 'visual.spec.ts',
      grep: isLinux || process.env.GLYPH_VISUAL === '1' ? undefined : /$^/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1100, height: 800 } },
    },
  ],
  webServer: {
    command: `pnpm exec vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
