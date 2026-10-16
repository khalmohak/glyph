import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defaultClientConditions, defineConfig } from 'vite'
import { docsData } from './plugins/docs-data'

export default defineConfig({
  // GitHub Pages serves the docs from /glyph/; locally they run at /.
  base: process.env.DOCS_BASE ?? '/',
  plugins: [react(), tailwindcss(), docsData()],
  resolve: {
    conditions: ['@glyphui/source', ...defaultClientConditions],
  },
})
