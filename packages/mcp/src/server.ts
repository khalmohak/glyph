import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { loadManifest } from './data'
import {
  componentLine,
  componentMarkdown,
  exampleBlock,
  fullMarkdown,
  guideList,
  guideMarkdown,
  hitsMarkdown,
  packageOf,
} from './format'
import type { Manifest } from './manifest'
import { findComponent, findGuide, suggestComponents } from './resolve'
import { buildIndex, search } from './search'
import { setupFeatures, setupMarkdown, setupPackages } from './setup'
import { themingMarkdown } from './theming'

const text = (body: string) => ({ content: [{ type: 'text' as const, text: body }] })
const notFound = (body: string) => ({ ...text(body), isError: true })
const readOnly = { readOnlyHint: true, openWorldHint: false } as const

/** The server's own guidance, sent to the client at initialization. */
export function instructions(m: Manifest): string {
  return [
    `Glyph ${m.version}: React 19 components on Tailwind CSS v4, themed by one typed file (glyph.theme.ts). Packages: ${m.packages.map((p) => p.name).join(', ')}.`,
    'Before writing UI code with Glyph, look up the real API here instead of guessing prop names:',
    '- New project or missing providers: get_setup.',
    '- Find a component: list_components (by category or package) or search_docs (free text; also covers guides and props).',
    '- Use a component: get_component gives install, import, props, theme slots, accessibility and examples.',
    '- Restyle: get_theming, then the theme file. Prefer the theme file over className overrides on each use.',
    '- Patterns (forms, data tables, auth, routing, testing): list_guides and get_guide.',
    'Import from the entry each component lists (for example @glyphui/ui/form); components marked planned do not exist yet.',
  ].join('\n')
}

export interface GlyphServerOptions {
  /** Defaults to the manifest bundled with the package. */
  manifest?: Manifest
}

/** An MCP server for Glyph's components, guides and theming, ready to connect to a transport. */
export function createGlyphServer({
  manifest = loadManifest(),
}: GlyphServerOptions = {}): McpServer {
  const m = manifest
  const server = new McpServer(
    { name: 'glyph', title: 'Glyph UI', version: m.version, websiteUrl: `${m.site.url}/docs/ai` },
    { instructions: instructions(m) },
  )
  let index: ReturnType<typeof buildIndex> | undefined
  const categories = [...new Set(m.components.map((c) => c.category))]

  const unknownComponent = (name: string) => {
    const suggestions = suggestComponents(m, name)
    return notFound(
      `No component named "${name}".${suggestions.length ? ` Did you mean: ${suggestions.join(', ')}?` : ''} Use list_components or search_docs to find one.`,
    )
  }

  server.registerTool(
    'list_components',
    {
      title: 'List components',
      description:
        'Lists Glyph components with their import entry and a one-line description, grouped by category. Filter by category, status, package or a substring of the name or description.',
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe(`One of: ${categories.join(', ')}. Case-insensitive.`),
        status: z.enum(['stable', 'beta', 'planned']).optional(),
        package: z
          .string()
          .optional()
          .describe('A package or entry, such as @glyphui/blocks or @glyphui/viewers/pdf.'),
        query: z.string().optional().describe('Matches the name, exports or description.'),
      },
      annotations: { ...readOnly, title: 'List components' },
    },
    ({ category, status, package: pkg, query }) => {
      if (category && !categories.some((c) => c.toLowerCase() === category.toLowerCase()))
        return notFound(`Unknown category "${category}". Categories: ${categories.join(', ')}.`)
      const q = query?.toLowerCase()
      const list = m.components.filter(
        (c) =>
          (!category || c.category.toLowerCase() === category.toLowerCase()) &&
          (!status || c.status === status) &&
          (!pkg || c.entry === pkg || packageOf(c.entry) === pkg) &&
          (!q ||
            c.name.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.exports.some((e) => e.toLowerCase().includes(q))),
      )
      if (list.length === 0) return text('No components match. Try search_docs for free text.')
      const out = [`# Glyph ${m.version} components (${list.length})`]
      for (const cat of categories) {
        const inCategory = list.filter((c) => c.category === cat)
        if (inCategory.length) out.push('', `## ${cat}`, '', ...inCategory.map(componentLine))
      }
      out.push('', 'Details, props and examples: get_component.')
      return text(out.join('\n'))
    },
  )

  server.registerTool(
    'get_component',
    {
      title: 'Get a component',
      description:
        'Everything needed to use one component correctly: install and import, peer dependencies, CSS, props for each export, theme slots and variants, keyboard behavior, and example code. Accepts a name, docs slug or export (Button, date-picker, useConfirm).',
      inputSchema: {
        name: z.string().min(1).describe('Component name, docs slug or exported name.'),
        examples: z
          .boolean()
          .default(true)
          .describe('Include full example code. Set false for a shorter answer that lists them.'),
      },
      annotations: { ...readOnly, title: 'Get a component' },
    },
    ({ name, examples }) => {
      const c = findComponent(m, name)
      return c ? text(componentMarkdown(m, c, { examples })) : unknownComponent(name)
    },
  )

  server.registerTool(
    'get_example',
    {
      title: 'Get an example',
      description:
        "Returns one example's full source for a component, or lists the component's examples when `example` is omitted.",
      inputSchema: {
        component: z.string().min(1).describe('Component name, slug or export.'),
        example: z
          .string()
          .optional()
          .describe('Example file name or title, as listed by get_component.'),
      },
      annotations: { ...readOnly, title: 'Get an example' },
    },
    ({ component, example }) => {
      const c = findComponent(m, component)
      if (!c) return unknownComponent(component)
      if (c.examples.length === 0) return notFound(`${c.name} has no examples.`)
      const listing = c.examples.map((e) => `- \`${e.file}\`: ${e.title}`).join('\n')
      if (!example) return text(`# ${c.name} examples\n\n${listing}`)
      const key = example.toLowerCase()
      const found = c.examples.find(
        (e) => e.file.toLowerCase() === key || e.title.toLowerCase() === key,
      )
      return found
        ? text(exampleBlock(found))
        : notFound(`${c.name} has no example "${example}". Its examples:\n\n${listing}`)
    },
  )

  server.registerTool(
    'search_docs',
    {
      title: 'Search the docs',
      description:
        'Full-text search over components, props, guide sections and release notes. Use it for questions like "server side pagination" or "protect a route"; open results with get_component or get_guide.',
      inputSchema: {
        query: z.string().min(1),
        limit: z.number().int().min(1).max(50).default(10),
      },
      annotations: { ...readOnly, title: 'Search the docs' },
    },
    ({ query, limit }) => {
      index ??= buildIndex(m)
      return text(hitsMarkdown(query, search(index, query, limit)))
    },
  )

  server.registerTool(
    'list_guides',
    {
      title: 'List guides',
      description:
        'Lists the guides: setup, theming, motion, routing, forms, data tables, auth, viewers, accessibility, testing, migration.',
      inputSchema: {},
      annotations: { ...readOnly, title: 'List guides' },
    },
    () => text(guideList(m)),
  )

  server.registerTool(
    'get_guide',
    {
      title: 'Get a guide',
      description:
        'Returns a guide as Markdown with its code. Accepts the slug or title from list_guides.',
      inputSchema: {
        slug: z.string().min(1).describe('Guide slug, such as forms or data-tables.'),
      },
      annotations: { ...readOnly, title: 'Get a guide' },
    },
    ({ slug }) => {
      const g = findGuide(m, slug)
      return g
        ? text(guideMarkdown(g))
        : notFound(`No guide "${slug}". Guides: ${m.guides.map((x) => x.slug).join(', ')}.`)
    },
  )

  server.registerTool(
    'get_setup',
    {
      title: 'Set up Glyph',
      description:
        'Exact install commands, CSS imports, color-mode setup, a theme file and the provider tree for a new or existing app. Use it before adding Glyph to a project.',
      inputSchema: {
        framework: z.enum(['vite', 'next', 'other']).default('vite'),
        packages: z
          .array(z.enum(setupPackages))
          .default(['ui'])
          .describe('Glyph packages to use. ui is always included.'),
        features: z
          .array(z.enum(setupFeatures))
          .default([])
          .describe('Parts of @glyphui/ui that need extra dependencies.'),
        router: z
          .enum(['react-router', 'none'])
          .optional()
          .describe('Defaults to react-router for vite and other, none for next.'),
      },
      annotations: { ...readOnly, title: 'Set up Glyph' },
    },
    (options) => text(setupMarkdown(m, options)),
  )

  server.registerTool(
    'get_theming',
    {
      title: 'Theming reference',
      description:
        'How the theme file works: presets, every token a theme sets, per-component defaults and slots, and a complete example.',
      inputSchema: {},
      annotations: { ...readOnly, title: 'Theming reference' },
    },
    () => text(themingMarkdown(m)),
  )

  server.registerResource(
    'llms-full',
    'glyph://llms-full',
    {
      title: 'Glyph docs (full)',
      description: 'Every guide and component in one Markdown document.',
      mimeType: 'text/markdown',
    },
    (uri) => ({ contents: [{ uri: uri.href, mimeType: 'text/markdown', text: fullMarkdown(m) }] }),
  )

  const live = m.components.filter((c) => c.status !== 'planned')
  server.registerResource(
    'component',
    new ResourceTemplate('glyph://components/{slug}', {
      list: () => ({
        resources: live.map((c) => ({
          uri: `glyph://components/${c.slug}`,
          name: c.name,
          description: c.description,
          mimeType: 'text/markdown',
        })),
      }),
      complete: { slug: (value) => live.map((c) => c.slug).filter((s) => s.startsWith(value)) },
    }),
    { title: 'Component', description: 'One component as Markdown.', mimeType: 'text/markdown' },
    (uri, { slug }) => {
      const c = findComponent(m, String(slug))
      if (!c) throw new Error(`No component "${slug}"`)
      return {
        contents: [{ uri: uri.href, mimeType: 'text/markdown', text: componentMarkdown(m, c) }],
      }
    },
  )

  server.registerResource(
    'guide',
    new ResourceTemplate('glyph://guides/{slug}', {
      list: () => ({
        resources: m.guides.map((g) => ({
          uri: `glyph://guides/${g.slug}`,
          name: g.title,
          description: g.description,
          mimeType: 'text/markdown',
        })),
      }),
      complete: { slug: (value) => m.guides.map((g) => g.slug).filter((s) => s.startsWith(value)) },
    }),
    { title: 'Guide', description: 'One guide as Markdown.', mimeType: 'text/markdown' },
    (uri, { slug }) => {
      const g = findGuide(m, String(slug))
      if (!g) throw new Error(`No guide "${slug}"`)
      return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: guideMarkdown(g) }] }
    },
  )

  server.registerPrompt(
    'build-with-glyph',
    {
      title: 'Build with Glyph',
      description: 'Build a screen or feature with Glyph components, checking each API first.',
      argsSchema: {
        task: z.string().describe('What to build, such as "a settings page with a profile form".'),
      },
    },
    ({ task }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              `Build this with Glyph ${m.version}: ${task}`,
              '',
              '1. If the project has no GlyphProvider yet, call get_setup and follow it.',
              '2. Call search_docs or list_components to pick components. Prefer an existing block or pattern over building from primitives.',
              '3. Call get_component for each one before using it, and use only the props and imports it lists.',
              '4. Style through the theme file (get_theming) and the semantic token utilities (bg-primary, text-muted-foreground), not hard-coded colors.',
              '5. Keep the accessibility behavior get_component describes: labels, keyboard support, focus handling.',
            ].join('\n'),
          },
        },
      ],
    }),
  )

  return server
}
