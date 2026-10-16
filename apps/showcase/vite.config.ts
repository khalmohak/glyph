import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defaultClientConditions, defineConfig } from 'vite'

export default defineConfig({
  // Relative asset URLs so the build works from any path.
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    // Use Glyph's TypeScript source in the monorepo: instant HMR, no library rebuilds.
    conditions: ['@glyphkit/source', ...defaultClientConditions],
  },
})
