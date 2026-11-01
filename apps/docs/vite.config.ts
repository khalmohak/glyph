import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import { defaultClientConditions, defineConfig } from 'vite'
import { docsContent } from './plugins/docs-content'
import { docsData } from './plugins/docs-data'
import { remarkGuide } from './plugins/guides'
import { prerender } from './plugins/prerender'

export default defineConfig({
  // GitHub Pages serves the docs from /glyph/; locally they run at /.
  base: process.env.DOCS_BASE ?? '/',
  // lib/site.ts reads process.env.SITE_URL, DEMO_URL and AUTH_URL in Node (prerender, llms.txt) and in the browser.
  define: {
    'process.env.SITE_URL': JSON.stringify(process.env.SITE_URL ?? ''),
    'process.env.DEMO_URL': JSON.stringify(process.env.DEMO_URL ?? ''),
    'process.env.AUTH_URL': JSON.stringify(process.env.AUTH_URL ?? ''),
    // PostHog's project API key (public by design); lib/analytics.ts stays off without it.
    'process.env.POSTHOG_KEY': JSON.stringify(process.env.POSTHOG_KEY ?? ''),
  },
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
    prerender(),
  ],
  resolve: {
    conditions: ['@glyphui/source', ...defaultClientConditions],
  },
  // Playwright writes traces and results under e2e/; reloading the page for those is noise.
  server: { watch: { ignored: ['**/e2e/.results/**', '**/e2e/.report/**'] } },
})
