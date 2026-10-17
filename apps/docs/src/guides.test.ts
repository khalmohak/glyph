// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseChangelog, readChangelog } from '../plugins/changelog'
import { type CodeSnippet, guideCodeBlocks, readGuides } from '../plugins/guides'
import { guideMarkdown, loadMetas, type MarkdownContext, markdownFiles } from '../plugins/llms'
import { guides as siteGuides, staticRoutes } from './lib/site'

const docsRoot = resolve(__dirname, '..')
const guidesDir = join(docsRoot, 'src/guides')
const contentRoot = join(docsRoot, 'src/content')
const guideFiles = readdirSync(guidesDir).filter((f) => f.endsWith('.mdx'))
const guides = readGuides(guidesDir)

const componentSlugs = readdirSync(contentRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
const routes = new Set([
  '',
  ...staticRoutes.map((r) => r.path),
  ...componentSlugs.map((slug) => `components/${slug}`),
])

describe('guides', () => {
  it('match the site map: one MDX file per guide, same order, title and description', () => {
    expect(guides.map((g) => g.slug)).toEqual(siteGuides.map((g) => g.slug))
    for (const guide of guides) {
      const site = siteGuides.find((g) => g.slug === guide.slug)
      expect(guide.title, guide.slug).toBe(site?.title)
      expect(guide.description, guide.slug).toBe(site?.description)
    }
  })

  it('have unique order numbers and at least one section heading', () => {
    expect(new Set(guides.map((g) => g.order)).size).toBe(guides.length)
    for (const guide of guides) expect(guide.headings.length, guide.slug).toBeGreaterThan(0)
  })

  it('link only to routes and anchors that exist', () => {
    const broken: string[] = []
    for (const file of guideFiles) {
      const slug = file.replace(/\.mdx$/, '')
      const source = readFileSync(join(guidesDir, file), 'utf8').replace(/^```[\s\S]*?^```/gm, '')
      for (const match of source.matchAll(/\]\(((?:\/|#)[^)\s]*)\)/g)) {
        const href = match[1] as string
        const [path = '', hash] = href.split('#')
        const route = path ? path.replace(/^\/|\/$/g, '') : `docs/${slug}`
        if (!routes.has(route)) {
          broken.push(`${slug}: ${href} (no such page)`)
          continue
        }
        if (hash && route.startsWith('docs/')) {
          const target = guides.find((g) => `docs/${g.slug}` === route)
          if (!target?.headings.some((h) => h.id === hash))
            broken.push(`${slug}: ${href} (no such heading)`)
        }
      }
    }
    expect(broken).toEqual([])
  })

  it('embed only examples that exist', () => {
    const missing: string[] = []
    for (const file of guideFiles) {
      const source = readFileSync(join(guidesDir, file), 'utf8')
      for (const match of source.matchAll(/<Example id="([^"]+)"/g)) {
        const [slug, example] = (match[1] as string).split('/')
        if (!existsSync(join(contentRoot, slug as string, 'examples', `${example}.tsx`)))
          missing.push(`${file}: ${match[1]}`)
      }
    }
    expect(missing).toEqual([])
  })
})

describe('Markdown exports', () => {
  async function context(): Promise<MarkdownContext> {
    return {
      contentRoot,
      guidesDir,
      metas: await loadMetas(contentRoot),
      guides,
      props: {},
      changelog: [],
      version: '0.0.0',
    }
  }

  it('llms.txt links every guide and every built component', async () => {
    const ctx = await context()
    const index = markdownFiles(ctx).get('llms.txt') ?? ''
    for (const guide of guides) expect(index).toContain(`/docs/${guide.slug}.md`)
    for (const meta of ctx.metas.filter((m) => m.status !== 'planned'))
      expect(index).toContain(`/components/${meta.slug}.md`)
  })

  it('has a .md page for every guide and component', async () => {
    const ctx = await context()
    const files = markdownFiles(ctx)
    for (const guide of guides) expect(files.has(`docs/${guide.slug}.md`)).toBe(true)
    for (const meta of ctx.metas) expect(files.has(`components/${meta.slug}.md`)).toBe(true)
  })

  it('turns guide components into Markdown and leaves code blocks untouched', async () => {
    const ctx = await context()
    const source = [
      '---',
      'title: T',
      '---',
      '<Install packages="@glyphui/ui" dev />',
      'See [forms](/docs/forms).',
      '```tsx title="a.tsx" check',
      "import { x } from './x'",
      'const link = "[a](/b)"',
      '```',
    ].join('\n')
    const guide = guides[0] as (typeof guides)[number]
    const md = guideMarkdown(source, guide, ctx)
    expect(md).toContain('npm install -D @glyphui/ui')
    expect(md).toContain('(https://khalmohak.github.io/glyph/docs/forms)')
    expect(md).toContain('```tsx title="a.tsx"\n')
    expect(md).toContain("import { x } from './x'")
    expect(md).toContain('"[a](/b)"')
  })
})

describe('changelog', () => {
  it('strips the PR, commit and author prefix and drops dependency bumps', () => {
    const [release] = parseChangelog(
      [
        '# @glyphui/ui',
        '',
        '## 0.7.0',
        '',
        '### Minor Changes',
        '',
        '- [#24](https://github.com/x/y/pull/24) [`b746553`](https://github.com/x/y/commit/b746553) Thanks [@me](https://github.com/me)! - Adds a thing.',
        '',
        '  More detail.',
        '',
        '### Patch Changes',
        '',
        '- Updated dependencies []:',
        '  - @glyphui/tokens@0.7.0',
      ].join('\n'),
      '@glyphui/ui',
    )
    expect(release?.version).toBe('0.7.0')
    expect(release?.entries).toHaveLength(1)
    expect(release?.entries[0]).toMatchObject({
      text: 'Adds a thing.\n\nMore detail.',
      kind: 'minor',
      pr: { number: 24 },
      commit: { sha: 'b746553' },
    })
  })

  it('lists an entry shared by several packages once, newest release first', () => {
    const releases = readChangelog(
      join(docsRoot, '../../packages'),
      join(docsRoot, '../../.changeset'),
    )
    const versions = releases.map((r) => r.version).filter((v) => v !== 'Unreleased')
    expect(versions[0]).not.toBe('0.1.0')
    expect(versions.at(-1)).toBe('0.1.0')
    for (const release of releases) {
      const texts = release.entries.map((e) => e.text)
      expect(new Set(texts).size, release.version).toBe(texts.length)
      for (const entry of release.entries) expect(entry.text).not.toMatch(/^Updated dependencies/)
    }
  })
})

/**
 * Code blocks marked `check` are type-checked against the real packages, so the guides
 * can't drift from the API. Each guide is its own folder (blocks with a `title` keep their
 * path, so files in one guide can import each other); relative imports the guide doesn't
 * define get a typed-as-any stub.
 */
describe('guide code', () => {
  const checkRoot = join(docsRoot, '.guide-check')

  function stubFor(imports: { names: Set<string>; defaults: boolean }): string {
    const lines = [...imports.names].map(
      (name) => `// biome-ignore lint: stub\nexport const ${name}: any = undefined`,
    )
    if (imports.defaults) lines.push('const value: any = undefined', 'export default value')
    return `${lines.join('\n')}\n`
  }

  function writeGuide(guide: string, blocks: CodeSnippet[]) {
    const dir = join(checkRoot, guide)
    const files = new Map<string, string>()
    blocks.forEach((block, i) => {
      const ext = block.lang === 'ts' ? 'ts' : 'tsx'
      files.set(block.title ?? `snippet-${i}.${ext}`, block.code)
    })
    const exists = (base: string) =>
      ['', '.ts', '.tsx', '/index.ts', '/index.tsx'].some((ext) => files.has(`${base}${ext}`))
    const stubs = new Map<string, { names: Set<string>; defaults: boolean }>()
    for (const [path, code] of files) {
      for (const match of code.matchAll(
        /^import\s+(type\s+)?(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s+'(\.[^']+)'/gm,
      )) {
        if (match[1] || (match[4] as string).match(/\.(css|svg|png)$/)) continue
        const target = join(dirname(path), match[4] as string).replace(/\\/g, '/')
        if (exists(target)) continue
        const stub = stubs.get(target) ?? { names: new Set<string>(), defaults: false }
        if (match[2]) stub.defaults = true
        for (const name of (match[3] ?? '').split(',')) {
          const local = name
            .trim()
            .split(/\s+as\s+/)[0]
            ?.replace(/^type\s+/, '')
          if (local) stub.names.add(local)
        }
        stubs.set(target, stub)
      }
    }
    for (const [target, stub] of stubs) files.set(`${target}.tsx`, stubFor(stub))
    for (const [path, code] of files) {
      const file = join(dir, path)
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, code)
    }
  }

  it('compiles every block marked `check`', () => {
    rmSync(checkRoot, { recursive: true, force: true })
    let count = 0
    for (const file of guideFiles) {
      const blocks = guideCodeBlocks(join(guidesDir, file)).filter((b) => b.check)
      count += blocks.length
      if (blocks.length) writeGuide(file.replace(/\.mdx$/, ''), blocks)
    }
    expect(count).toBeGreaterThan(20)
    writeFileSync(
      join(checkRoot, 'tsconfig.json'),
      JSON.stringify({
        extends: '../tsconfig.json',
        // Snippets show one piece of an app, so unused names are fine.
        compilerOptions: { noUnusedLocals: false, noUnusedParameters: false },
        include: ['**/*.ts', '**/*.tsx'],
      }),
    )
    const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc')
    let output = ''
    try {
      execFileSync(process.execPath, [tsc, '-p', join(checkRoot, 'tsconfig.json')], {
        encoding: 'utf8',
        stdio: 'pipe',
      })
    } catch (error) {
      output = String((error as { stdout?: string }).stdout ?? error)
    }
    expect(output.replace(new RegExp(`${checkRoot}/`, 'g'), '')).toBe('')
  }, 180_000)
})
