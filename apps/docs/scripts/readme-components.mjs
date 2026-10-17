// Prints the README component table from the docs catalog, so the list never goes stale.
// Run: pnpm -C apps/docs readme:components
import { createServer } from 'vite'

const server = await createServer({
  root: new URL('..', import.meta.url).pathname,
  configFile: false,
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  resolve: { conditions: ['@glyphui/source'] },
  ssr: { resolve: { conditions: ['@glyphui/source'] } },
})

try {
  const { docsByCategory } = await server.ssrLoadModule('/src/lib/catalog.ts')
  const rows = docsByCategory().map(({ category, items }) => {
    const label = category === 'Blocks' ? 'Blocks (`@glyphui/blocks`)' : category
    return `| ${label} | ${items.map((doc) => doc.name).join(' · ')} |`
  })
  const total = docsByCategory().reduce((sum, group) => sum + group.items.length, 0)
  console.log(`| Category | Components (${total}) |\n|---|---|\n${rows.join('\n')}`)
} finally {
  await server.close()
}
