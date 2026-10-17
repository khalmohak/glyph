import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { loadManifest } from './data'
import { createGlyphServer } from './server'
import { fixture } from './test/fixture'

async function connect(server = createGlyphServer({ manifest: fixture })) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'test', version: '0.0.0' })
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  return client
}

type ToolResult = { content: { type: string; text: string }[]; isError?: boolean }

describe('createGlyphServer', () => {
  let client: Client
  const call = async (name: string, args: Record<string, unknown> = {}) => {
    const result = (await client.callTool({ name, arguments: args })) as ToolResult
    return { text: result.content[0]?.text ?? '', isError: Boolean(result.isError) }
  }

  beforeAll(async () => {
    client = await connect()
  })
  afterAll(() => client.close())

  it('introduces itself with the Glyph version', () => {
    expect(client.getServerVersion()).toMatchObject({ name: 'glyph', version: '1.2.3' })
    expect(client.getInstructions()).toMatch(/^Glyph 1\.2\.3:/)
    expect(client.getInstructions()).toContain('get_component')
  })

  it('lists every tool as read-only', async () => {
    const { tools } = await client.listTools()
    expect(tools.map((t) => t.name).sort()).toEqual([
      'get_component',
      'get_example',
      'get_guide',
      'get_setup',
      'get_theming',
      'list_components',
      'list_guides',
      'search_docs',
    ])
    for (const tool of tools) expect(tool.annotations?.readOnlyHint).toBe(true)
  })

  it('list_components groups by category and filters', async () => {
    const all = await call('list_components')
    expect(all.text).toContain('# Glyph 1.2.3 components (4)')
    expect(all.text).toContain('## Actions\n\n- **Button**')
    expect((await call('list_components', { category: 'blocks' })).text).toContain('HeroSection')
    const beta = await call('list_components', { status: 'beta' })
    expect(beta.text).toContain('(1)')
    expect(beta.text).toContain('DataTable')
    expect((await call('list_components', { package: '@glyphui/ui' })).text).toContain('(3)')
    expect((await call('list_components', { package: '@glyphui/ui/data-table' })).text).toContain(
      '(1)',
    )
    expect((await call('list_components', { query: 'useDataTable' })).text).toContain('DataTable')
    expect((await call('list_components', { query: 'nothing like this' })).text).toMatch(
      /^No components/,
    )
    const bad = await call('list_components', { category: 'Nope' })
    expect(bad.isError).toBe(true)
    expect(bad.text).toContain('Categories: Actions, Data display, Blocks.')
  })

  it('get_component resolves names and suggests on a miss', async () => {
    const button = await call('get_component', { name: 'icon-button' })
    expect(button.text).toMatch(/^# Button/)
    expect(button.text).toContain('<Button loading />')
    const short = await call('get_component', { name: 'Button', examples: false })
    expect(short.text).not.toContain('<Button loading />')
    const miss = await call('get_component', { name: 'Buton' })
    expect(miss.isError).toBe(true)
    expect(miss.text).toContain('Did you mean: Button?')
    expect((await call('get_component', { name: 'qqqqqqqq' })).text).not.toContain('Did you mean')
  })

  it('get_example lists and returns examples', async () => {
    expect((await call('get_example', { component: 'Button' })).text).toBe(
      '# Button examples\n\n- `variants`: Variants\n- `loading`: Loading',
    )
    expect((await call('get_example', { component: 'Button', example: 'Loading' })).text).toContain(
      '<Button loading />',
    )
    const missing = await call('get_example', { component: 'Button', example: 'nope' })
    expect(missing.isError).toBe(true)
    expect(missing.text).toContain('- `variants`: Variants')
    expect((await call('get_example', { component: 'HeroSection' })).isError).toBe(true)
    expect((await call('get_example', { component: 'Nope' })).isError).toBe(true)
  })

  it('search_docs returns ranked hits', async () => {
    const { text } = await call('search_docs', { query: 'server pagination', limit: 3 })
    expect(text).toContain('# Results for "server pagination"')
    expect(text).toContain('→ `get_guide` "data-tables"')
    expect((await call('search_docs', { query: 'zzzz' })).text).toMatch(/^No results/)
  })

  it('list_guides and get_guide', async () => {
    expect((await call('list_guides')).text).toContain('(`theming`, Foundations)')
    expect((await call('get_guide', { slug: 'Theming' })).text).toBe(
      '# Theming\n\n## Dark mode\n\nSet colors per mode.',
    )
    const miss = await call('get_guide', { slug: 'routing' })
    expect(miss.isError).toBe(true)
    expect(miss.text).toContain('Guides: data-tables, theming.')
  })

  it('get_setup and get_theming', async () => {
    const setup = await call('get_setup', { framework: 'next', packages: ['blocks'] })
    expect(setup.text).toContain('npm install @glyphui/ui @glyphui/blocks\n')
    expect((await call('get_setup')).text).toContain('with Vite')
    expect((await call('get_theming')).text).toContain('`presets.brutalist`')
  })

  it('rejects invalid arguments', async () => {
    const result = await call('get_setup', { framework: 'remix' })
    expect(result.isError).toBe(true)
  })

  it('serves the full docs, components and guides as resources', async () => {
    const { resources } = await client.listResources()
    const uris = resources.map((r) => r.uri)
    expect(uris).toContain('glyph://llms-full')
    expect(uris).toContain('glyph://components/button')
    expect(uris).not.toContain('glyph://components/carousel')
    expect(uris).toContain('glyph://guides/theming')

    const read = async (uri: string) =>
      ((await client.readResource({ uri })).contents[0] as { text: string }).text
    expect(await read('glyph://llms-full')).toMatch(/^# Glyph 1\.2\.3/)
    expect(await read('glyph://components/data-table')).toMatch(/^# DataTable/)
    expect(await read('glyph://guides/data-tables')).toMatch(/^# Data tables/)
    await expect(read('glyph://components/nope')).rejects.toThrow()
    await expect(read('glyph://guides/nope')).rejects.toThrow()

    const { completion } = await client.complete({
      ref: { type: 'ref/resource', uri: 'glyph://components/{slug}' },
      argument: { name: 'slug', value: 'da' },
    })
    expect(completion.values).toEqual(['data-table'])
    const guides = await client.complete({
      ref: { type: 'ref/resource', uri: 'glyph://guides/{slug}' },
      argument: { name: 'slug', value: 'the' },
    })
    expect(guides.completion.values).toEqual(['theming'])
  })

  it('offers the build-with-glyph prompt', async () => {
    const { prompts } = await client.listPrompts()
    expect(prompts.map((p) => p.name)).toEqual(['build-with-glyph'])
    const prompt = await client.getPrompt({
      name: 'build-with-glyph',
      arguments: { task: 'a settings page' },
    })
    const message = prompt.messages[0]?.content as { text: string }
    expect(message.text).toMatch(/^Build this with Glyph 1\.2\.3: a settings page/)
    expect(message.text).toContain('get_component')
  })
})

describe('the bundled manifest', () => {
  it('backs the default server', async () => {
    const manifest = loadManifest()
    expect(loadManifest()).toBe(manifest)
    const client = await connect(createGlyphServer())
    expect(client.getServerVersion()?.version).toBe(manifest.version)
    const result = (await client.callTool({
      name: 'get_component',
      arguments: { name: 'Button' },
    })) as ToolResult
    expect(result.content[0]?.text).toMatch(/^# Button/)
    await client.close()
  })

  it('covers every documented component and guide', () => {
    const manifest = loadManifest()
    expect(manifest.components.length).toBeGreaterThan(100)
    expect(manifest.guides.map((g) => g.slug)).toContain('getting-started')
    for (const c of manifest.components) {
      expect(c.slug).toMatch(/^[a-z0-9-]+$/)
      expect(c.entry).toMatch(/^@glyphui\//)
    }
    expect(manifest.packages.map((p) => p.name)).toContain('@glyphui/mcp')
  })
})
