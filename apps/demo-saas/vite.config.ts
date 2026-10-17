import { glyphColorMode } from '@glyphui/ui/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defaultClientConditions, defineConfig } from 'vite'

export default defineConfig({
  base: process.env.DEMO_BASE ?? '/',
  plugins: [react(), tailwindcss(), glyphColorMode({ defaultMode: 'system' })],
  resolve: {
    // Use Glyph's TypeScript source in the monorepo: instant HMR, no library rebuilds.
    conditions: ['@glyphui/source', ...defaultClientConditions],
  },
})
