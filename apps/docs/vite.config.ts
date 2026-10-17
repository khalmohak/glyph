import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import { defaultClientConditions, defineConfig } from 'vite'
import { docsContent } from './plugins/docs-content'
import { docsData } from './plugins/docs-data'
import { remarkGuide } from './plugins/guides'

export default defineConfig({
  // GitHub Pages serves the docs from /glyph/; locally they run at /.
  base: process.env.DOCS_BASE ?? '/',
  plugins: [
    // Guides are MDX. Frontmatter is read separately (plugins/guides.ts), so it's only stripped here.
    {
      enforce: 'pre',
      ...mdx({ remarkPlugins: [remarkFrontmatter, remarkGfm, remarkGuide] }),
    },
    react({ include: /\.(mdx|tsx?)$/ }),
    tailwindcss(),
    docsData(),
    docsContent(),
  ],
  resolve: {
    conditions: ['@glyphui/source', ...defaultClientConditions],
  },
  // Playwright writes traces and results under e2e/; reloading the page for those is noise.
  server: { watch: { ignored: ['**/e2e/.results/**', '**/e2e/.report/**'] } },
})
