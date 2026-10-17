import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithGlyph } from '../test-utils'
import { MarkdownViewer, slugify } from './markdown-viewer'

const md = `# Getting started

Use **Glyph** with *any* router.

| Plan | Seats |
| --- | ---: |
| Team | 10 |

- [x] Install
- [ ] Theme

\`\`\`ts
const theme = defineTheme({})
\`\`\`

<script>alert('x')</script>
`

describe('MarkdownViewer', () => {
  it('renders GitHub-flavored Markdown with heading anchors', async () => {
    renderWithGlyph(<MarkdownViewer content={md} />)
    const heading = await screen.findByRole('heading', { level: 1, name: /Getting started/ })
    expect(heading).toHaveAttribute('id', 'getting-started')
    expect(screen.getByRole('link', { name: 'Link to Getting started' })).toHaveAttribute(
      'href',
      '#getting-started',
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes[0]).toBeChecked()
    expect(boxes[1]).not.toBeChecked()
    expect(screen.getByRole('region', { name: 'Code' })).toHaveTextContent('const theme')
  })

  it('never runs raw HTML', async () => {
    const { container } = renderWithGlyph(<MarkdownViewer content={md} />)
    await screen.findByRole('table')
    expect(container.querySelector('script')).toBeNull()
  })

  it('neutralizes script URLs in links and images', async () => {
    const { container } = renderWithGlyph(
      <MarkdownViewer
        content={'[click](javascript:alert(1)) ![x](javascript:alert(2)) [ok](https://glyph.dev)'}
      />,
    )
    await screen.findByRole('link', { name: 'ok' })
    for (const el of container.querySelectorAll('a[href], img[src]')) {
      expect(el.getAttribute('href') ?? el.getAttribute('src')).not.toMatch(/^\s*javascript:/i)
    }
  })

  it('gives repeated headings unique ids, like GitHub', async () => {
    renderWithGlyph(<MarkdownViewer content={'## Setup\n\n## Setup\n\n## Setup'} />)
    const headings = await screen.findAllByRole('heading', { name: /Setup/ })
    expect(headings.map((h) => h.id)).toEqual(['setup', 'setup-1', 'setup-2'])
  })

  it('can leave out heading anchors and load a source', async () => {
    renderWithGlyph(<MarkdownViewer source={new Blob(['## Notes'])} headingAnchors={false} />)
    expect(await screen.findByRole('heading', { name: 'Notes' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

it('slugify makes URL-safe ids', () => {
  expect(slugify('Rate limits & quotas!')).toBe('rate-limits-quotas')
  expect(slugify('  Ünïcode  héadings ')).toBe('ünïcode-héadings')
})
