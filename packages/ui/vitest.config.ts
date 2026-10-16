import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@glyphui/tokens': new URL('../tokens/src/index.ts', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
