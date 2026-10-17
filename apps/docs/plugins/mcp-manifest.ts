import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type {
  Manifest,
  ManifestComponent,
  ManifestExample,
  ManifestPackage,
  ManifestPreset,
  ManifestStyles,
} from '../../../packages/mcp/src/manifest'
import { addedIn } from '../src/lib/added'
import { AUTH_URL, DEMO_URL, LIVE_URL, REPO_URL } from '../src/lib/site'
import { readChangelog } from './changelog'
import { extractAllProps } from './docs-data'
import { readGuides } from './guides'
import { guideMarkdown, loadMetas, type MarkdownContext } from './llms'

/**
 * The data behind @glyphui/mcp, built from the same sources as the docs site: content
 * metadata and examples, props extracted from the packages' TypeScript, each component's
 * `tv()` styles, the guides as Markdown, the changelog, the token schema and the presets.
 *
 * Runs under Vite's SSR loader (scripts/mcp-manifest.mjs) so the packages load from source.
 */

const here = dirname(fileURLToPath(import.meta.url))
const docsRoot = resolve(here, '..')
const repoRoot = resolve(docsRoot, '../..')
const contentRoot = join(docsRoot, 'src/content')
const guidesDir = join(docsRoot, 'src/guides')
const packagesDir = join(repoRoot, 'packages')

/** Package entries whose exports include component styles (`buttonStyles` and so on). */
const styleModules = [
  '@glyphui/ui',
  '@glyphui/ui/form',
  '@glyphui/ui/data-table',
  '@glyphui/ui/chart',
  '@glyphui/blocks',
  '@glyphui/auth/ui',
  '@glyphui/viewers',
  '@glyphui/viewers/pdf',
  '@glyphui/viewers/csv',
  '@glyphui/viewers/spreadsheet',
  '@glyphui/viewers/json',
  '@glyphui/viewers/code',
  '@glyphui/viewers/markdown',
  '@glyphui/viewers/diff',
  '@glyphui/viewers/media',
]

/** The packages that make up Glyph, in the order people install them. */
const packageNames = ['ui', 'blocks', 'auth', 'viewers', 'tokens', 'mcp']

interface StylesFn {
  slots?: Record<string, unknown>
  variants?: Record<string, Record<string, unknown>>
  defaultVariants?: Record<string, unknown>
}

type Loader = (id: string) => Promise<Record<string, unknown>>

function examples(
  slug: string,
  list: readonly { file: string; title: string; description?: string }[] | undefined,
  kind: ManifestExample['kind'],
): ManifestExample[] {
  const dir = join(contentRoot, slug, kind === 'example' ? 'examples' : 'snippets')
  return (list ?? []).flatMap((item) => {
    const path = ['tsx', 'ts'].map((ext) => join(dir, `${item.file}.${ext}`)).find(existsSync)
    if (!path) return []
    return [
      {
        file: item.file,
        title: item.title,
        ...(item.description && { description: item.description }),
        code: readFileSync(path, 'utf8').trim(),
        kind,
      },
    ]
  })
}

async function stylesIndex(load: Loader): Promise<Map<string, StylesFn>> {
  const index = new Map<string, StylesFn>()
  for (const id of styleModules) {
    const mod = await load(id).catch(() => ({}) as Record<string, unknown>)
    for (const [name, value] of Object.entries(mod)) {
      if (!name.endsWith('Styles') || typeof value !== 'function') continue
      const key = name.toLowerCase()
      if (!index.has(key)) index.set(key, value as StylesFn)
    }
  }
  return index
}

function stylesFor(component: string, index: Map<string, StylesFn>): ManifestStyles | null {
  // Case-insensitive, so acronyms match either spelling (InputOTP → inputOtpStyles).
  const styles = index.get(`${component}Styles`.toLowerCase())
  if (!styles?.slots) return null
  return {
    component,
    slots: Object.keys(styles.slots),
    variants: Object.fromEntries(
      Object.entries(styles.variants ?? {}).map(([name, values]) => [name, Object.keys(values)]),
    ),
    defaultVariants: Object.fromEntries(
      Object.entries(styles.defaultVariants ?? {}).map(([k, v]) => [k, String(v)]),
    ),
  }
}

function readPackages(): ManifestPackage[] {
  return packageNames.flatMap((dir) => {
    const file = join(packagesDir, dir, 'package.json')
    if (!existsSync(file)) return []
    const pkg = JSON.parse(readFileSync(file, 'utf8'))
    const exportsMap = (pkg.exports ?? {}) as Record<string, unknown>
    const entries = Object.keys(exportsMap)
      .filter((key) => !key.endsWith('.css') && !key.endsWith('.json'))
      .map((key) => (key === '.' ? pkg.name : `${pkg.name}${key.slice(1)}`))
    const optional = pkg.peerDependenciesMeta ?? {}
    return [
      {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description ?? '',
        entries,
        ...('./styles.css' in exportsMap && { stylesheet: `${pkg.name}/styles.css` }),
        peers: Object.entries((pkg.peerDependencies ?? {}) as Record<string, string>).map(
          ([name, range]) => ({ name, range, optional: Boolean(optional[name]?.optional) }),
        ),
      },
    ]
  })
}

/** Preset descriptions come from the JSDoc above each preset in ui/src/themes.ts. */
function presetDescriptions(): Record<string, string> {
  const source = readFileSync(join(packagesDir, 'ui/src/themes.ts'), 'utf8')
  const out: Record<string, string> = {}
  for (const match of source.matchAll(/\/\*\*\s*([^*]+?)\s*\*\/\s*export const (\w+)/g))
    out[match[2] as string] = (match[1] as string).trim()
  return out
}

async function theming(load: Loader): Promise<Manifest['theming']> {
  const tokens = await load('@glyphui/tokens')
  const groups: Record<string, string> = {
    colors: 'colorTokens',
    chart: 'chartTokens',
    statusText: 'statusTextTokens',
    radius: 'radiusTokens',
    shadow: 'shadowTokens',
    font: 'fontTokens',
    text: 'textTokens',
    duration: 'durationTokens',
    easing: 'easingTokens',
    control: 'controlSizes',
    motionLevel: 'motionLevels',
    mode: 'colorModes',
  }
  const tokenLists = Object.fromEntries(
    Object.entries(groups).map(([group, name]) => [group, [...((tokens[name] as string[]) ?? [])]]),
  )
  const ui = await load('@glyphui/ui')
  const descriptions = presetDescriptions()
  type Preset = {
    name: string
    colors: { light: Record<string, string>; dark: Record<string, string> }
    font: Record<string, string>
    radius: Record<string, string>
    motion?: { level?: string }
    components?: Record<string, unknown>
  }
  const presets = Object.entries((ui.presets ?? {}) as Record<string, Preset>).map(
    ([name, preset]): ManifestPreset => ({
      name,
      description: descriptions[name] ?? '',
      primary: { light: preset.colors.light.primary ?? '', dark: preset.colors.dark.primary ?? '' },
      fonts: {
        sans: preset.font.sans ?? '',
        display: preset.font.display ?? '',
        mono: preset.font.mono ?? '',
      },
      radius: preset.radius,
      ...(preset.motion?.level && { motionLevel: preset.motion.level }),
      recipes: Object.keys(preset.components ?? {}),
    }),
  )
  return { tokens: tokenLists, presets }
}

export async function buildMcpManifest(load: Loader): Promise<Manifest> {
  const metas = await loadMetas(contentRoot)
  const props = extractAllProps()
  const guides = readGuides(guidesDir)
  const changelog = readChangelog(packagesDir, join(repoRoot, '.changeset'))
  const version = JSON.parse(readFileSync(join(packagesDir, 'ui/package.json'), 'utf8')).version
  const ctx: MarkdownContext = { contentRoot, guidesDir, metas, guides, props, changelog, version }
  const styles = await stylesIndex(load)

  const components = metas.map((meta): ManifestComponent => {
    const exportsList = [...(meta.exports ?? [])]
    // Props for the documented export first, then any other component export that has props.
    const propNames = [
      ...(meta.propsOf ? [meta.propsOf] : []),
      ...exportsList.filter((name) => /^[A-Z]/.test(name) && name !== meta.propsOf),
    ]
    const componentProps = Object.fromEntries(
      propNames.flatMap((name) => (props[name]?.length ? [[name, props[name]]] : [])),
    )
    const styleNames = [...new Set([meta.propsOf ?? meta.name, ...exportsList])].filter((n) =>
      /^[A-Z]/.test(n),
    )
    return {
      name: meta.name,
      slug: meta.slug,
      category: meta.category,
      status: meta.status,
      description: meta.description,
      entry: meta.entry ?? '@glyphui/ui',
      exports: exportsList,
      notes: [...(meta.notes ?? [])],
      ...(meta.radix && { radix: meta.radix }),
      props: componentProps,
      examples: [
        ...examples(meta.slug, meta.examples, 'example'),
        ...examples(meta.slug, meta.snippets, 'snippet'),
      ],
      styles: styleNames.flatMap((name) => stylesFor(name, styles) ?? []),
      ...(meta.a11y && {
        a11y: {
          keyboard: (meta.a11y.keyboard ?? []).map((k) => ({ keys: k.keys, action: k.action })),
          notes: [...(meta.a11y.notes ?? [])],
        },
      }),
      ...(addedIn[meta.slug] && { added: addedIn[meta.slug] }),
    }
  })

  return {
    version,
    site: { url: LIVE_URL, demoUrl: DEMO_URL, authUrl: AUTH_URL, repo: REPO_URL },
    packages: readPackages(),
    components,
    guides: guides.map((guide) => ({
      slug: guide.slug,
      title: guide.title,
      description: guide.description,
      section: guide.section,
      headings: guide.headings,
      markdown: guideMarkdown(
        readFileSync(join(guidesDir, `${guide.slug}.mdx`), 'utf8'),
        guide,
        ctx,
      ),
    })),
    changelog: changelog.slice(0, 12).map((release) => ({
      version: release.version,
      entries: release.entries.map((e) => ({ text: e.text, packages: e.packages, kind: e.kind })),
    })),
    theming: await theming(load),
  }
}
