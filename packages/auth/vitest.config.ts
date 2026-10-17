import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Resolve @glyphui/* to their TypeScript source, plus Vite's default client conditions.
  resolve: { conditions: ['@glyphui/source', 'module', 'browser', 'development|production'] },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.test-d.ts', 'src/test/**', 'src/**/index.ts'],
      reporter: ['text-summary', 'html', 'json-summary'],
      // A floor just under current numbers: coverage can only go up.
      thresholds: { lines: 98, statements: 98, branches: 88, functions: 94 },
    },
  },
})
