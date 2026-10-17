import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.test-d.ts',
        'src/test/**',
        'src/test-setup.ts',
        'src/**/index.ts',
      ],
      reporter: ['text-summary', 'html', 'json-summary'],
      // A floor just under current numbers: coverage can only go up. Raise it as tests land.
      thresholds: { lines: 99, statements: 99, branches: 92, functions: 98 },
    },
  },
})
