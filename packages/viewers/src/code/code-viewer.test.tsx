import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithGlyph } from '../test-utils'
import { CodeViewer, parseLineRanges } from './code-viewer'
import { highlightCode, languageFromFileName, resolveLanguage } from './highlighter'

describe('highlighting', () => {
  it('maps file names and aliases to Shiki languages', () => {
    expect(languageFromFileName('reminders.ts')).toBe('typescript')
    expect(languageFromFileName('Dockerfile')).toBe('docker')
    expect(languageFromFileName('README')).toBeUndefined()
    expect(resolveLanguage('.PY')).toBe('python')
    expect(resolveLanguage(undefined)).toBe('plaintext')
  })

  it('colors tokens with theme variables, loading the grammar on demand', async () => {
    const lines = await highlightCode('const total = 1', 'ts')
    const tokens = lines[0] ?? []
    expect(tokens.map((t) => t.content).join('')).toBe('const total = 1')
    expect(tokens.find((t) => t.content.includes('const'))?.color).toMatch(
      /var\(--shiki-token-keyword/,
    )
  })

  it('falls back to plain text for unknown languages', async () => {
    expect(await highlightCode('a\nb', 'not-a-language')).toEqual([
      [{ content: 'a' }],
      [{ content: 'b' }],
    ])
  })
})

describe('parseLineRanges', () => {
  it('reads strings and arrays', () => {
    expect([...parseLineRanges('3, 6-8')]).toEqual([3, 6, 7, 8])
    expect([...parseLineRanges([1, [4, 5]])]).toEqual([1, 4, 5])
    expect(parseLineRanges(undefined).size).toBe(0)
  })
})

describe('CodeViewer', () => {
  it('shows numbered, highlighted lines with the file name and language', async () => {
    renderWithGlyph(
      <CodeViewer
        code={'let a = 1\nlet b = 2\nlet c = 3'}
        fileName="vars.js"
        highlightLines={[11]}
        startLine={10}
      />,
    )
    expect(screen.getByText('vars.js')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()
    const region = screen.getByRole('region', { name: 'vars.js' })
    const line = region.querySelector('[data-line="11"]')
    expect(line).toHaveAttribute('data-mark', 'highlight')
    await waitFor(() =>
      expect(region.querySelector('[style*="--shiki-token-keyword"]')).not.toBeNull(),
    )
  })

  it('copies the code and toggles wrapping', async () => {
    const writeText = vi.fn(async () => {})
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    renderWithGlyph(<CodeViewer code="print('hi')" language="python" />)
    await userEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(writeText).toHaveBeenCalledWith("print('hi')")
    const wrap = screen.getByRole('button', { name: 'Wrap lines' })
    await userEvent.click(wrap)
    expect(screen.getByRole('button', { name: 'Don’t wrap lines' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('loads a source and can hide the header', async () => {
    renderWithGlyph(<CodeViewer source={new Blob(['SELECT 1;'])} language="sql" hideHeader />)
    expect(await screen.findByText(/SELECT/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copy code' })).not.toBeInTheDocument()
  })

  it('marks diff lines', () => {
    renderWithGlyph(<CodeViewer code={'a\nb'} lineMarks={{ 1: 'removed', 2: 'added' }} />)
    expect(document.querySelector('[data-line="1"]')).toHaveAttribute('data-mark', 'removed')
    expect(document.querySelector('[data-line="2"]')).toHaveAttribute('data-mark', 'added')
  })
})
