import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Resolve @glyphui/* to their TypeScript source, plus Vite's default client conditions.
  resolve: { conditions: ['@glyphui/source', 'module', 'browser', 'development|production'] },
  test: {
    environment: 'jsdom',
    // CI runners run every package's suite at once; interaction tests need headroom there.
    testTimeout: 20_000,
    hookTimeout: 30_000,
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.test-d.ts',
        'src/test-setup.ts',
        'src/**/index.ts',
      ],
      reporter: ['text-summary', 'html', 'json-summary'],
      // A floor just under current numbers: coverage can only go up. Raise it as tests land.
      thresholds: { lines: 90, statements: 90, branches: 82, functions: 72 },
    },
  },
})
