import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@glyphkit/tokens': new URL('../tokens/src/index.ts', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
