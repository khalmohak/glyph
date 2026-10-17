import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { readChangelog } from './changelog'
import { extractAllProps } from './docs-data'
import { readGuides } from './guides'
import { loadMetas, type MarkdownContext, markdownFiles } from './llms'

/**
 * Guides, changelog and the Markdown exports:
 * - `virtual:glyph-guides`: every guide's frontmatter and headings (sidebar, table of
 *   contents, search).
 * - `virtual:glyph-changelog`: the merged release timeline.
 * - `/llms.txt`, `/llms-full.txt`, `/changelog.md`, `/docs/<guide>.md` and
 *   `/components/<slug>.md`: written into the build, and served on the fly in dev.
 */

const GUIDES_ID = 'virtual:glyph-guides'
const CHANGELOG_ID = 'virtual:glyph-changelog'
/** Only the version numbers, for search: the full changelog stays out of the main bundle. */
const RELEASES_ID = 'virtual:glyph-releases'

export function docsContent(): Plugin {
  const root = resolve(__dirname, '..')
  const guidesDir = join(root, 'src/guides')
  const contentRoot = join(root, 'src/content')
  const packagesDir = resolve(root, '../../packages')
  const changesetDir = resolve(root, '../../.changeset')
  let config: ResolvedConfig | undefined
  let server: ViteDevServer | undefined
  let markdown: Promise<Map<string, string>> | null = null

  const changelog = () => readChangelog(packagesDir, changesetDir)

  async function context(): Promise<MarkdownContext> {
    const version = JSON.parse(readFileSync(join(packagesDir, 'ui/package.json'), 'utf8')).version
    return {
      contentRoot,
      guidesDir,
      metas: await loadMetas(contentRoot),
      guides: readGuides(guidesDir),
      props: extractAllProps(),
      changelog: changelog(),
      version,
    }
  }
  const files = () => {
    markdown ??= context().then(markdownFiles)
    return markdown
  }

  const invalidate = (id: string) => {
    const mod = server?.moduleGraph.getModuleById(`\0${id}`)
    if (mod) server?.reloadModule(mod)
  }

  return {
    name: 'glyph-docs-content',
    configResolved(resolved) {
      config = resolved
    },
    resolveId(id) {
      if (id === GUIDES_ID || id === CHANGELOG_ID || id === RELEASES_ID) return `\0${id}`
    },
    load(id) {
      if (id === `\0${GUIDES_ID}`) return `export default ${JSON.stringify(readGuides(guidesDir))}`
      if (id === `\0${CHANGELOG_ID}`) return `export default ${JSON.stringify(changelog())}`
      if (id === `\0${RELEASES_ID}`)
        return `export default ${JSON.stringify(changelog().map((r) => r.version))}`
    },
    configureServer(s) {
      server = s
      s.watcher.add([guidesDir, changesetDir, join(packagesDir, '*/CHANGELOG.md')])
      s.watcher.on('change', (file) => {
        markdown = null
        if (file.startsWith(guidesDir)) invalidate(GUIDES_ID)
        if (file.endsWith('CHANGELOG.md') || file.startsWith(changesetDir)) {
          invalidate(CHANGELOG_ID)
          invalidate(RELEASES_ID)
        }
      })
      // Markdown alternates and llms.txt, generated on request.
      s.middlewares.use(async (req, res, next) => {
        const path = decodeURIComponent((req.url ?? '').split('?')[0] ?? '').replace(/^\//, '')
        if (!/\.(md|txt)$/.test(path)) return next()
        const body = (await files()).get(path)
        if (body === undefined) return next()
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
        res.end(body)
      })
    },
    async closeBundle() {
      if (config?.command !== 'build') return
      const outDir = resolve(config.root, config.build.outDir)
      for (const [path, body] of await files()) {
        const target = join(outDir, path)
        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, body)
      }
    },
  }
}
