import { describe, expect, it } from 'vitest'
import { loadManifest } from './data'
import { buildIndex, search, tokenize } from './search'
import { fixture } from './test/fixture'

describe('tokenize', () => {
  it('splits camelCase, kebab-case and punctuation, and drops stopwords', () => {
    expect(tokenize('DataTable')).toEqual(['data', 'table'])
    expect(tokenize('date-picker')).toEqual(['date', 'picker'])
    expect(tokenize('How do I use the HTMLParser?')).toEqual(['html', 'parser'])
  })

  it('folds simple plurals', () => {
    expect(tokenize('tables filters class')).toEqual(['table', 'filter', 'class'])
  })

  it('reads "server side" and "client-side" as one word', () => {
    expect(tokenize('server side pagination')).toEqual(['server', 'pagination'])
    expect(tokenize('client-side sorting')).toEqual(['client', 'sorting'])
  })
})

describe('search (fixture)', () => {
  const index = buildIndex(fixture)

  it('indexes components, props, guide sections and release notes', () => {
    const kinds = new Set(index.map((d) => d.kind))
    expect(kinds).toEqual(new Set(['component', 'prop', 'guide', 'changelog']))
    const section = index.find((d) => d.title === 'Data tables › Server mode')
    expect(section?.url).toBe('https://glyph.test/docs/data-tables#server-mode')
    expect(section?.snippet).toBe('With mode="server" the table hands pagination to your API.')
    expect(index.find((d) => d.title === 'Carousel (planned)')).toBeDefined()
  })

  it('ranks the best match first and returns refs to open it', () => {
    const [top] = search(index, 'button')
    expect(top).toMatchObject({ kind: 'component', title: 'Button', ref: 'Button' })
    expect(search(index, 'dark mode')[0]).toMatchObject({ kind: 'guide', ref: 'theming' })
    expect(search(index, 'rowCount')[0]).toMatchObject({
      kind: 'prop',
      title: 'DataTable.rowCount',
    })
  })

  it('ranks documents matching every word above partial matches', () => {
    const titles = search(index, 'server pagination').map((h) => h.title)
    // Both mention server mode and pagination; the rowCount prop only mentions server mode.
    expect(titles.slice(0, 2).sort()).toEqual(['Data tables › Server mode', 'DataTable'])
    expect(titles.indexOf('DataTable.rowCount')).toBeGreaterThan(1)
  })

  it('leaves out the guide to the MCP server itself', () => {
    const m = {
      ...fixture,
      guides: [...fixture.guides, { ...fixture.guides[1]!, slug: 'ai', title: 'Use with AI' }],
    }
    expect(buildIndex(m).some((d) => d.title.startsWith('Use with AI'))).toBe(false)
  })

  it('honors the limit and returns nothing for empty queries', () => {
    expect(search(index, 'table', 2)).toHaveLength(2)
    expect(search(index, 'the of and')).toEqual([])
    expect(search(index, 'zzzz')).toEqual([])
  })
})

describe('search (bundled manifest)', () => {
  const index = buildIndex(loadManifest())
  const top = (query: string) => search(index, query, 3).map((h) => h.title)

  it.each([
    ['server side pagination', 'Data tables › Server mode'],
    ['protected route', 'Protected routes'],
    ['dark mode', 'Theming › Dark mode'],
    ['pdf', 'PdfViewer'],
    ['toast', 'Toast'],
    ['form validation zod', 'Form'],
    ['csv export', 'DataTable.exportCsv'],
  ])('"%s" finds %s first', (query, title) => {
    expect(top(query)[0]).toBe(title)
  })

  it('finds a component and its guide for a pattern', () => {
    expect(top('modal with form')).toEqual(expect.arrayContaining(['Modal']))
  })
})
