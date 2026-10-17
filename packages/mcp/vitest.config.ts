import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/test/**', 'src/index.ts', 'src/cli.ts', 'src/manifest.ts'],
      reporter: ['text-summary', 'html', 'json-summary'],
      // A floor just under current numbers: coverage can only go up. Raise it as tests land.
      thresholds: { lines: 99, statements: 99, branches: 95, functions: 98 },
    },
  },
})
