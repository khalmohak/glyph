import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { withCustomConfig } from 'react-docgen-typescript'
import { codeToHtml, createCssVariablesTheme } from 'shiki'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { LIVE_URL, staticRoutes } from '../src/lib/site'

/** This file's folder. Works under Vite's config bundler, its SSR loader and plain Node. */
const here = dirname(fileURLToPath(import.meta.url))

/**
 * Build-time data for the docs:
 * - `virtual:glyph-props`: prop tables for every component, extracted from @glyphui/ui's
 *   TypeScript source with react-docgen-typescript. Props inherited from React or Radix
 *   types are left out; the page links to Radix for those.
 * - `virtual:glyph-examples`: syntax-highlighted source of every example file. Colors are
 *   CSS variables, so highlighting follows the active Glyph theme.
 */

const PROPS_ID = 'virtual:glyph-props'
const EXAMPLES_ID = 'virtual:glyph-examples'
const SIZES_ID = 'virtual:glyph-sizes'

const theme = createCssVariablesTheme({
  name: 'glyph',
  variablePrefix: '--shiki-',
  fontStyle: true,
})

function walk(dir: string, filter: (file: string) => boolean): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return walk(path, filter)
    return filter(path) ? [path] : []
  })
}

export interface PropDoc {
  name: string
  type: string
  required: boolean
  defaultValue?: string
  description?: string
}

function extractProps(root: string): Record<string, PropDoc[]> {
  const parser = withCustomConfig(join(root, 'tsconfig.json'), {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: (prop) =>
      prop.name !== 'key' && !(prop.parent?.fileName.includes('node_modules') ?? false),
  })
  const files = walk(join(root, 'src'), (f) => f.endsWith('.tsx') && !f.includes('.test'))
  const out: Record<string, PropDoc[]> = {}
  for (const doc of parser.parse(files)) {
    if (out[doc.displayName]) continue
    out[doc.displayName] = Object.values(doc.props)
      .map((p) => ({
        name: p.name,
        type: p.type.raw ?? p.type.name,
        required: p.required,
        ...(p.defaultValue?.value != null && { defaultValue: String(p.defaultValue.value) }),
        ...(p.description && { description: p.description }),
      }))
      .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name))
  }
  return out
}

/** Props of every package's components. ui last, so its names win on a clash. */
export function extractAllProps(): Record<string, PropDoc[]> {
  const packages = resolve(here, '../../../packages')
  return Object.assign(
    {},
    extractProps(join(packages, 'auth')),
    extractProps(join(packages, 'blocks')),
    extractProps(join(packages, 'viewers')),
    extractProps(join(packages, 'ui')),
  )
}

async function highlightExamples(
  contentRoot: string,
): Promise<Record<string, { code: string; html: string }>> {
  // Examples render live; snippets (setup code for services the docs can't run) are shown only.
  const files = walk(contentRoot, (f) => /\/(examples|snippets)\/[^/]+\.tsx?$/.test(f))
  const entries = await Promise.all(
    files.map(async (file) => {
      const code = readFileSync(file, 'utf8').trim()
      const html = await codeToHtml(code, { lang: file.endsWith('.ts') ? 'ts' : 'tsx', theme })
      const key = relative(contentRoot, file)
        .replace(/\\/g, '/')
        .replace('/examples/', '/')
        .replace(/\.tsx?$/, '')
      return [key, { code, html }] as const
    }),
  )
  return Object.fromEntries(entries)
}

/**
 * `virtual:glyph-sizes`: gzipped bytes of each component imported on its own from the built
 * package (`export { Button } from '@glyphui/ui'`), with peer dependencies and other Glyph
 * packages left out, the way scripts/size.mjs measures entries. Results are cached on disk by
 * the built file's modification time; when packages aren't built, sizes are simply missing.
 */
interface SizeTarget {
  slug: string
  pkg: string
  file: string
  name: string
}

function sizeTargets(contentRoot: string, repoRoot: string): SizeTarget[] {
  const targets: SizeTarget[] = []
  for (const dir of readdirSync(contentRoot, { withFileTypes: true })) {
    const meta = join(contentRoot, dir.name, 'meta.ts')
    if (!dir.isDirectory() || !existsSync(meta)) continue
    const src = readFileSync(meta, 'utf8')
    if (/status:\s*'planned'/.test(src)) continue
    const entry = src.match(/entry:\s*'([^']+)'/)?.[1] ?? '@glyphui/ui'
    const propsOf = src.match(/propsOf:\s*'([^']+)'/)?.[1]?.replace(/Props$/, '')
    const exportList = [
      ...(src.match(/exports:\s*\[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([^']+)'/g),
    ].map((m) => m[1] as string)
    const name = propsOf ?? exportList.find((e) => /^[A-Z]/.test(e)) ?? exportList[0]
    if (!name) continue
    const [, pkg, sub] = entry.match(/^@glyphui\/([^/]+)(?:\/(.+))?$/) ?? []
    if (!pkg) continue
    const pkgDir = join(repoRoot, 'packages', pkg)
    const json = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'))
    const target = json.exports?.[sub ? `./${sub}` : '.']
    const rel = typeof target === 'string' ? target : (target?.import ?? target?.default)
    if (typeof rel !== 'string') continue
    targets.push({ slug: dir.name, pkg, file: join(pkgDir, rel), name })
  }
  return targets
}

function externalsOf(repoRoot: string, pkg: string): string[] {
  const read = (name: string) =>
    JSON.parse(readFileSync(join(repoRoot, 'packages', name, 'package.json'), 'utf8'))
  const json = read(pkg)
  const shared = pkg === 'ui' ? [] : Object.keys(read('ui').dependencies ?? {})
  return [
    ...Object.keys(json.peerDependencies ?? {}),
    ...Object.keys(json.dependencies ?? {}).filter(
      (d) => d.startsWith('@glyphui/') || shared.includes(d),
    ),
    'react/jsx-runtime',
  ]
}

async function componentSizes(
  contentRoot: string,
  repoRoot: string,
  cacheFile: string,
): Promise<Record<string, number>> {
  const cache: Record<string, { key: string; bytes: number }> = existsSync(cacheFile)
    ? JSON.parse(readFileSync(cacheFile, 'utf8'))
    : {}
  let bundler: typeof import('rolldown').rolldown
  try {
    bundler = (await import('rolldown')).rolldown
  } catch {
    return {}
  }
  const targets = sizeTargets(contentRoot, repoRoot).filter((t) => existsSync(t.file))
  const out: Record<string, number> = {}
  const scratch = join(cacheFile, '..', 'entries')
  mkdirSync(scratch, { recursive: true })
  const measure = async (t: SizeTarget) => {
    const key = `${t.file}#${t.name}@${statSync(t.file).mtimeMs}`
    const hit = cache[t.slug]
    if (hit?.key === key) {
      out[t.slug] = hit.bytes
      return
    }
    try {
      const input = join(scratch, `${t.slug}.mjs`)
      writeFileSync(input, `export { ${t.name} } from ${JSON.stringify(t.file)}`)
      const deps = externalsOf(repoRoot, t.pkg)
      const bundle = await bundler({
        input,
        platform: 'browser',
        external: (id) => deps.some((d) => id === d || id.startsWith(`${d}/`)),
        transform: { define: { 'process.env.NODE_ENV': '"production"' } },
        logLevel: 'silent',
      })
      const { output } = await bundle.generate({ format: 'esm', minify: true })
      await bundle.close()
      // Up-front code only: lazily imported chunks load later, when used.
      const code = output
        .filter((o) => o.type === 'chunk' && !o.isDynamicEntry)
        .map((o) => (o as { code: string }).code)
        .join('\n')
      const bytes = gzipSync(code, { level: 9 }).length
      out[t.slug] = bytes
      cache[t.slug] = { key, bytes }
    } catch {
      // A component that can't be bundled on its own just gets no size badge.
    }
  }
  const queue = [...targets]
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let t = queue.shift(); t; t = queue.shift()) await measure(t)
    }),
  )
  writeFileSync(cacheFile, JSON.stringify(cache))
  return out
}

interface RouteMeta {
  path: string
  title: string
  description?: string
}

const SITE = 'Glyph'
const SITE_DESCRIPTION =
  'React components on Tailwind CSS v4 that take their whole look from one typed theme file.'

/** Reads name and description from meta.ts and roadmap.ts without executing them. */
function routeMetas(contentRoot: string): RouteMeta[] {
  const field = (src: string, key: string) =>
    src.match(new RegExp(`${key}:\\s*(?:\\n\\s*)?(['"\`])((?:\\\\.|(?!\\1).)*)\\1`))?.[2]
  // Static sections and guides come from the site map; component pages from content/.
  const routes: RouteMeta[] = staticRoutes.map(({ path, title, description }) => ({
    path,
    title,
    description,
  }))
  for (const dir of readdirSync(contentRoot, { withFileTypes: true })) {
    const meta = join(contentRoot, dir.name, 'meta.ts')
    if (!dir.isDirectory() || !existsSync(meta)) continue
    const src = readFileSync(meta, 'utf8')
    const description = field(src, 'description')
    routes.push({
      path: `components/${dir.name}`,
      title: `${field(src, 'name') ?? dir.name} · ${SITE}`,
      ...(description && { description }),
    })
  }
  const roadmap = readFileSync(join(contentRoot, 'roadmap.ts'), 'utf8')
  for (const entry of roadmap.matchAll(/\{[^{}]*?slug: '([^']+)'[^{}]*?\}/g)) {
    const name = field(entry[0], 'name') ?? entry[1]
    if (!routes.some((r) => r.path === `components/${entry[1]}`)) {
      routes.push({ path: `components/${entry[1]}`, title: `${name} (planned) · ${SITE}` })
    }
  }
  return routes
}

const escapeAttr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

export function docsData(): Plugin {
  const uiRoot = resolve(here, '../../../packages/ui')
  const viewersRoot = resolve(here, '../../../packages/viewers')
  const sources = [uiRoot, viewersRoot]
  const contentRoot = resolve(here, '../src/content')
  let props: Record<string, PropDoc[]> | null = null
  let sizes: Promise<Record<string, number>> | null = null
  const repoRoot = resolve(here, '../../..')
  const sizesCache = resolve(here, '../node_modules/.cache/glyph-docs/sizes.json')
  const loadSizes = () => {
    if (process.env.DOCS_SIZES === '0') return Promise.resolve({})
    mkdirSync(join(sizesCache, '..'), { recursive: true })
    sizes ??= componentSizes(contentRoot, repoRoot, sizesCache)
    return sizes
  }
  const cachedSizes = (): Record<string, number> => {
    if (!existsSync(sizesCache)) return {}
    const cache = JSON.parse(readFileSync(sizesCache, 'utf8')) as Record<string, { bytes: number }>
    return Object.fromEntries(Object.entries(cache).map(([slug, v]) => [slug, v.bytes]))
  }
  let server: ViteDevServer | undefined
  let config: ResolvedConfig | undefined

  const invalidate = (id: string) => {
    const mod = server?.moduleGraph.getModuleById(`\0${id}`)
    if (mod) server?.reloadModule(mod)
  }

  return {
    name: 'glyph-docs-data',
    configResolved(resolved) {
      config = resolved
    },
    // Static hosts (GitHub Pages) return 404 for client-side routes. Write an index.html for
    // every route, with its own title and description, so deep links load and get indexed.
    closeBundle() {
      if (config?.command !== 'build') return
      const outDir = resolve(config.root, config.build.outDir)
      const shell = readFileSync(join(outDir, 'index.html'), 'utf8')
      const urlOf = (path: string) => `${LIVE_URL}/${path ? `${path}/` : ''}`
      const page = (
        route: { path: string; title: string; description?: string },
        noindex = false,
      ) => {
        const title = escapeAttr(route.title)
        const description = escapeAttr(route.description ?? SITE_DESCRIPTION)
        const url = escapeAttr(urlOf(route.path))
        // Canonical and Open Graph URLs come from SITE_URL, so moving domains is one setting.
        const head = [
          `<link rel="canonical" href="${url}" />`,
          `<meta property="og:type" content="website" />`,
          `<meta property="og:site_name" content="${SITE}" />`,
          `<meta property="og:title" content="${title}" />`,
          `<meta property="og:description" content="${description}" />`,
          `<meta property="og:url" content="${url}" />`,
          `<meta name="twitter:card" content="summary" />`,
          ...(noindex ? ['<meta name="robots" content="noindex" />'] : []),
        ].join('\n    ')
        return shell
          .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
          .replace(
            /<meta name="description" content="[^"]*"/,
            `<meta name="description" content="${description}"`,
          )
          .replace('</head>', `    ${head}\n  </head>`)
      }
      const routes = routeMetas(contentRoot)
      for (const route of routes) {
        mkdirSync(join(outDir, route.path), { recursive: true })
        writeFileSync(join(outDir, route.path, 'index.html'), page(route))
      }
      // The blocks gallery's iframes load this one page with ?slug=&file=; keep it out of search.
      mkdirSync(join(outDir, 'blocks/frame'), { recursive: true })
      writeFileSync(
        join(outDir, 'blocks/frame/index.html'),
        page({ path: 'blocks/frame', title: `Block preview · ${SITE}` }, true),
      )
      // The home page keeps the shell's title; it gets the canonical and Open Graph tags too.
      const homeTitle = /<title>(.*?)<\/title>/.exec(shell)?.[1] ?? SITE
      writeFileSync(join(outDir, 'index.html'), page({ path: '', title: homeTitle }))
      writeFileSync(
        join(outDir, 'sitemap.xml'),
        [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          `  <url><loc>${escapeAttr(urlOf(''))}</loc></url>`,
          ...routes.map((route) => `  <url><loc>${escapeAttr(urlOf(route.path))}</loc></url>`),
          '</urlset>',
          '',
        ].join('\n'),
      )
      writeFileSync(
        join(outDir, 'robots.txt'),
        `User-agent: *\nDisallow: ${new URL(urlOf('blocks/frame')).pathname}\n\nSitemap: ${urlOf('')}sitemap.xml\n`,
      )
    },
    configureServer(s) {
      server = s
      s.watcher.add([...sources.map((root) => join(root, 'src')), contentRoot])
      s.watcher.on('change', (file) => {
        if (sources.some((root) => file.startsWith(join(root, 'src'))) && file.endsWith('.tsx')) {
          props = null
          invalidate(PROPS_ID)
        }
        if (file.startsWith(contentRoot) && file.includes('/examples/')) invalidate(EXAMPLES_ID)
      })
    },
    resolveId(id) {
      if (id === PROPS_ID || id === EXAMPLES_ID || id === SIZES_ID) return `\0${id}`
    },
    async load(id) {
      if (id === `\0${PROPS_ID}`) {
        props ??= extractAllProps()
        return `export default ${JSON.stringify(props)}`
      }
      if (id === `\0${SIZES_ID}`) {
        // Builds wait for fresh numbers; dev serves the cache and measures in the background.
        if (config?.command === 'build')
          return `export default ${JSON.stringify(await loadSizes())}`
        if (!sizes) void loadSizes().then(() => invalidate(SIZES_ID))
        return `export default ${JSON.stringify(cachedSizes())}`
      }
      if (id === `\0${EXAMPLES_ID}`) {
        return `export default ${JSON.stringify(await highlightExamples(contentRoot))}`
      }
    },
  }
}
