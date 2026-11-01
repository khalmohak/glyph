import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { build } from 'esbuild'
import { agentTargets, setupPrompt } from '../src/lib/agent-setup'
import type { DocMeta } from '../src/lib/doc'
import { categories } from '../src/lib/doc'
import { LIVE_URL, SITE_NAME } from '../src/lib/site'
import type { ChangelogRelease } from './changelog'
import type { GuideInfo } from './guides'

/**
 * Markdown versions of the docs for people and AI tools: one .md file per page, an index
 * (llms.txt, https://llmstxt.org) and everything in one file (llms-full.txt).
 */

export interface PropDoc {
  name: string
  type: string
  required: boolean
  defaultValue?: string
  description?: string
}

export interface MarkdownContext {
  contentRoot: string
  guidesDir: string
  metas: DocMeta[]
  guides: GuideInfo[]
  props: Record<string, PropDoc[]>
  changelog: ChangelogRelease[]
  version: string
}

const absolute = (path: string) => `${LIVE_URL}${path}`

/** Loads every content/<slug>/meta.ts (and the roadmap) by bundling it with esbuild. */
export async function loadMetas(contentRoot: string): Promise<DocMeta[]> {
  const files = readdirSync(contentRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(contentRoot, d.name, 'meta.ts')))
    .map((d) => join(contentRoot, d.name, 'meta.ts'))
  const load = async (file: string) => {
    const result = await build({
      entryPoints: [file],
      bundle: true,
      write: false,
      format: 'esm',
      platform: 'node',
      logLevel: 'silent',
    })
    const code = result.outputFiles[0]?.text ?? ''
    return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
  }
  const metas = await Promise.all(files.map(async (file) => (await load(file)).default as DocMeta))
  const roadmap = ((await load(join(contentRoot, 'roadmap.ts'))).roadmap ?? []) as DocMeta[]
  const built = new Set(metas.map((m) => m.slug))
  return [...metas, ...roadmap.filter((r) => !built.has(r.slug))].sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}

const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\n+/g, ' ')

function exampleSource(contentRoot: string, slug: string, file: string): string | null {
  for (const ext of ['tsx', 'ts']) {
    const path = join(contentRoot, slug, 'examples', `${file}.${ext}`)
    if (existsSync(path)) return readFileSync(path, 'utf8').trim()
  }
  return null
}

/** One component page as Markdown: description, import, notes, props and example code. */
export function componentMarkdown(meta: DocMeta, ctx: MarkdownContext): string {
  const lines = [`# ${meta.name}`, '', `> ${meta.description}`, '']
  lines.push(`Status: ${meta.status}. Category: ${meta.category}.`, '')
  if (meta.status === 'planned') {
    lines.push('Planned: not built yet.')
    return `${lines.join('\n')}\n`
  }
  const entry = meta.entry ?? '@glyphui/ui'
  const named = (meta.exports ?? [meta.name]).filter((n) => /^[A-Z]/.test(n)).slice(0, 6)
  lines.push(
    '```ts',
    `import { ${(named.length ? named : [meta.name]).join(', ')} } from '${entry}'`,
    '```',
    '',
  )
  if (meta.exports?.length)
    lines.push(`Exports: ${meta.exports.map((e) => `\`${e}\``).join(', ')}.`, '')
  if (meta.notes?.length) {
    lines.push('## Notes', '', ...meta.notes.map((note) => `- ${note}`), '')
  }
  const props = meta.propsOf ? ctx.props[meta.propsOf] : undefined
  if (props?.length) {
    lines.push(
      `## ${meta.propsOf} props`,
      '',
      '| Prop | Type | Default | Description |',
      '|---|---|---|---|',
    )
    for (const p of props)
      lines.push(
        `| \`${p.name}\`${p.required ? ' (required)' : ''} | \`${cell(p.type)}\` | ${p.defaultValue ? `\`${cell(p.defaultValue)}\`` : ''} | ${cell(p.description ?? '')} |`,
      )
    lines.push('')
  }
  for (const example of meta.examples ?? []) {
    const source = exampleSource(ctx.contentRoot, meta.slug, example.file)
    if (!source) continue
    lines.push(`## Example: ${example.title}`, '')
    if (example.description) lines.push(example.description, '')
    lines.push('```tsx', source, '```', '')
  }
  lines.push(`Live page: ${absolute(`/components/${meta.slug}`)}`)
  return `${lines.join('\n')}\n`
}

const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1]

/**
 * A guide's MDX as plain Markdown: frontmatter becomes the title, Glyph's MDX components
 * become their Markdown equivalents, and site links become absolute.
 */
export function guideMarkdown(source: string, guide: GuideInfo, ctx: MarkdownContext): string {
  const content = source.replace(/^---\n[\s\S]*?\n---\n/, '')
  // Rewrite prose only: code blocks keep their imports and links exactly as written.
  const body = content
    .split(/(^```[^\n]*\n[\s\S]*?^```$)/m)
    .map((part, i) => (i % 2 === 1 ? codeFence(part) : prose(part, ctx)))
    .join('')
  const md = [`# ${guide.title}`, '', `> ${guide.description}`, '', body.trim(), '']
  md.push(`Live page: ${absolute(`/docs/${guide.slug}`)}`)
  return `${md.join('\n')}\n`
}

/** Keeps a fence's language and file title; drops docs-only flags like `check`. */
function codeFence(block: string): string {
  return block.replace(/^(```\w*)([^\n]*)/, (_, fence: string, meta: string) => {
    const title = meta.match(/title="([^"]*)"/)?.[1]
    return title ? `${fence} title="${title}"` : fence
  })
}

function prose(text: string, ctx: MarkdownContext): string {
  let body = text
  body = body.replace(/<Install([^>]*)\/>/g, (tag) => {
    const dev = /\bdev\b/.test(tag)
    return ['```sh', `npm install ${dev ? '-D ' : ''}${attr(tag, 'packages') ?? ''}`, '```'].join(
      '\n',
    )
  })
  body = body.replace(/<Example([^>]*)\/>/g, (tag) => {
    const id = attr(tag, 'id') ?? ''
    const [slug = '', file = ''] = id.split('/')
    const code = exampleSource(ctx.contentRoot, slug, file)
    const link = `Live example: ${absolute(`/components/${slug}`)}`
    return code ? ['```tsx', code, '```', '', link].join('\n') : link
  })
  body = body.replace(
    /<Callout([^>]*)>([\s\S]*?)<\/Callout>/g,
    (_, attrs: string, inner: string) => {
      const title = attr(attrs, 'title')
      const text = inner
        .trim()
        .split('\n')
        .map((l) => `> ${l}`.trimEnd())
      return [`> **${title ?? 'Note'}**`, '>', ...text].join('\n')
    },
  )
  // The page has a tab per agent; Markdown gets Claude Code's prompt and a pointer to the rest.
  body = body.replace(/<AgentPrompt\s*\/>/g, () => {
    const [first] = agentTargets
    if (!first) return ''
    return [
      `Prompt for ${first.label}:`,
      '',
      '```text',
      setupPrompt(first),
      '```',
      '',
      `Prompts for ${agentTargets
        .slice(1)
        .filter((t) => t.mcp)
        .map((t) => t.label)
        .join(', ')} and other agents: ${absolute('/docs/ai')}`,
    ].join('\n')
  })
  body = body.replace(/<Steps>|<\/Steps>/g, '')
  return body.replace(/\]\((\/[^)]*)\)/g, (_, path: string) => `](${absolute(path)})`)
}

export function changelogMarkdown(ctx: MarkdownContext): string {
  const lines = [`# ${SITE_NAME} changelog`, '']
  for (const release of ctx.changelog) {
    lines.push(`## ${release.version}`, '')
    for (const entry of release.entries) {
      const [first = '', ...rest] = entry.text.split('\n')
      lines.push(
        `- ${first} (${entry.packages.join(', ')})`,
        ...rest.map((l) => (l ? `  ${l}` : l)),
      )
    }
    lines.push('')
  }
  return `${lines.join('\n')}\n`
}

const summary =
  'Glyph is a React 19 component library on Tailwind CSS v4, built for AI coding agents: an MCP server, this file and a Markdown version of every docs page give agents the real API for one exact version. One typed theme file sets color, type, shape, depth, motion and per-component defaults. Beyond components it ships solved patterns: schema-validated forms, a data table with server mode and URL state, app layout, charts, authentication with protected routes, and file viewers.'

/** What an agent writing Glyph code should do; also in the AGENTS.md block in the AI guide. */
const agentRules = [
  "Look up a component before using it (`get_component` in the MCP server, or its `.md` page below). Don't guess props.",
  'Import from the entry each component page lists, such as `@glyphui/ui/form` or `@glyphui/ui/data-table`, not always `@glyphui/ui`.',
  'Style through the theme file and token utilities (`bg-primary`, `text-muted-foreground`), not hard-coded colors.',
  'Prefer an existing pattern or block (Form, DataTable, AppShell, `@glyphui/blocks`) over rebuilding it from primitives.',
  'Keep labels, `aria-label` on icon-only buttons, and keyboard behavior.',
]

/** The llms.txt index: what Glyph is, how to install it, and a link to every page's Markdown. */
export function llmsIndex(ctx: MarkdownContext): string {
  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${summary}`,
    '',
    `Current version: ${ctx.version}. Packages: @glyphui/ui, @glyphui/blocks, @glyphui/auth, @glyphui/viewers, @glyphui/tokens, @glyphui/mcp (released together; keep them on the same version).`,
    '',
    'Install: `npm install @glyphui/ui`, then import `@glyphui/ui/fonts.css`, `tailwindcss` and `@glyphui/ui/styles.css` in your CSS and wrap the app in `<GlyphProvider>`.',
    '',
    `Coding agents: the MCP server \`@glyphui/mcp\` serves these docs as tools (component props, examples, setup, theming, search). Claude Code: \`claude mcp add glyph -- npx -y @glyphui/mcp\`. Cursor, VS Code, Codex, Windsurf and Claude Desktop: ${absolute('/docs/ai.md')}. Any docs URL returns Markdown when requested with \`Accept: text/markdown\`.`,
    '',
    'When writing code with Glyph:',
    '',
    ...agentRules.map((rule) => `- ${rule}`),
    '',
    '## Guides',
    '',
    ...ctx.guides.map((g) => `- [${g.title}](${absolute(`/docs/${g.slug}.md`)}): ${g.description}`),
    '',
  ]
  for (const category of categories) {
    const items = ctx.metas.filter((m) => m.category === category && m.status !== 'planned')
    if (items.length === 0) continue
    lines.push(`## ${category}`, '')
    for (const m of items)
      lines.push(`- [${m.name}](${absolute(`/components/${m.slug}.md`)}): ${m.description}`)
    lines.push('')
  }
  lines.push(
    '## Optional',
    '',
    `- [Changelog](${absolute('/changelog.md')}): every release, newest first`,
    `- [Everything in one file](${absolute('/llms-full.txt')})`,
    '',
  )
  return lines.join('\n')
}

/** Every guide and component page, concatenated. */
export function llmsFull(ctx: MarkdownContext): string {
  const parts = [llmsIndex(ctx)]
  for (const guide of ctx.guides) {
    const source = readFileSync(join(ctx.guidesDir, `${guide.slug}.mdx`), 'utf8')
    parts.push(guideMarkdown(source, guide, ctx))
  }
  for (const meta of ctx.metas.filter((m) => m.status !== 'planned'))
    parts.push(componentMarkdown(meta, ctx))
  return parts.join('\n---\n\n')
}

/** Every Markdown file the site serves, keyed by URL path without the base. */
export function markdownFiles(ctx: MarkdownContext): Map<string, string> {
  const files = new Map<string, string>()
  files.set('llms.txt', llmsIndex(ctx))
  files.set('llms-full.txt', llmsFull(ctx))
  files.set('changelog.md', changelogMarkdown(ctx))
  for (const guide of ctx.guides) {
    const source = readFileSync(join(ctx.guidesDir, `${guide.slug}.mdx`), 'utf8')
    files.set(`docs/${guide.slug}.md`, guideMarkdown(source, guide, ctx))
  }
  for (const meta of ctx.metas)
    files.set(`components/${meta.slug}.md`, componentMarkdown(meta, ctx))
  return files
}
