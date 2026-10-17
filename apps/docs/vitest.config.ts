import { defaultClientConditions, defaultServerConditions } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { conditions: ['@glyphui/source', ...defaultClientConditions] },
  // Server-rendering tests run in the node environment, which resolves with SSR conditions.
  ssr: { resolve: { conditions: ['@glyphui/source', ...defaultServerConditions] } },
  // e2e/ holds Playwright specs, run by `pnpm e2e`.
  test: { environment: 'jsdom', exclude: [...configDefaults.exclude, 'e2e/**'] },
})
