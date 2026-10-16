import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Resolve @glyphui/* to their TypeScript source, plus Vite's default client conditions.
  resolve: { conditions: ['@glyphui/source', 'module', 'browser', 'development|production'] },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.ts'], css: false },
})
