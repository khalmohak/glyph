import { defaultClientConditions } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { conditions: ['@glyphui/source', ...defaultClientConditions] },
  test: { environment: 'jsdom' },
})
