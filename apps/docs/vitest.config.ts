import { defaultClientConditions } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { conditions: ['@glyphui/source', ...defaultClientConditions] },
  // e2e/ holds Playwright specs, run by `pnpm e2e`.
  test: { environment: 'jsdom', exclude: [...configDefaults.exclude, 'e2e/**'] },
})
