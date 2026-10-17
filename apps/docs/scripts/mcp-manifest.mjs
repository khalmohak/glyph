// Writes the data file @glyphui/mcp answers from, built from the docs sources.
// Run from packages/mcp: `pnpm manifest` (part of its build).
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createServer } from 'vite'

const out = resolve(process.cwd(), process.argv[2] ?? 'manifest.json')

// Load the docs pipeline and the packages from their TypeScript source, like the docs dev server.
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
  const { buildMcpManifest } = await server.ssrLoadModule('/plugins/mcp-manifest.ts')
  const manifest = await buildMcpManifest((id) => server.ssrLoadModule(id))
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, `${JSON.stringify(manifest)}\n`)
  const kb = Math.round(Buffer.byteLength(JSON.stringify(manifest)) / 1024)
  console.log(
    `MCP manifest: ${manifest.components.length} components, ${manifest.guides.length} guides, Glyph ${manifest.version}, ${kb} kB → ${out}`,
  )
} finally {
  await server.close()
}
