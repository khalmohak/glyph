import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithGlyph } from '../test-utils'
import { computeDiff, type DiffLine, toSplitRows } from './compute'
import { DiffViewer } from './diff-viewer'

const lines = (n: number, prefix = 'line') =>
  Array.from({ length: n }, (_, i) => `${prefix} ${i + 1}`)

describe('computeDiff', () => {
  it('ignores Windows line endings and a missing final newline', () => {
    const crlf = computeDiff('a\r\nb\r\nc\r\n', 'a\nb\nc\n')
    expect([crlf.additions, crlf.deletions]).toEqual([0, 0])
    const eof = computeDiff('a\nb', 'a\nb\n')
    expect([eof.additions, eof.deletions]).toEqual([0, 0])
    const real = computeDiff('a\r\nold\r\n', 'a\nnew\n')
    expect([real.additions, real.deletions]).toEqual([1, 1])
    for (const item of real.items) {
      if ('text' in item) expect(item.text).not.toContain('\r')
    }
  })

  it('numbers lines and counts additions and deletions', () => {
    const { items, additions, deletions } = computeDiff('a\nb\nc\n', 'a\nB\nc\nd\n')
    expect(additions).toBe(2)
    expect(deletions).toBe(1)
    const changed = items.filter((i): i is DiffLine => i.type !== 'gap' && i.type !== 'context')
    expect(changed.map((l) => [l.type, l.oldNumber, l.newNumber, l.text])).toEqual([
      ['removed', 2, undefined, 'b'],
      ['added', undefined, 2, 'B'],
      ['added', undefined, 4, 'd'],
    ])
  })

  it('folds long unchanged stretches, keeping context around changes', () => {
    const before = lines(30).join('\n')
    const after = lines(30)
      .map((l, i) => (i === 14 ? 'changed' : l))
      .join('\n')
    const { items } = computeDiff(before, after, { context: 2 })
    const gaps = items.filter((i) => i.type === 'gap')
    expect(gaps).toHaveLength(2)
    expect(items.filter((i) => i.type === 'context')).toHaveLength(4)
  })

  it('adds word-level detail to edited lines', () => {
    const { items } = computeDiff('the quick fox\n', 'the slow fox\n')
    const removed = items.find((i) => i.type === 'removed') as DiffLine
    expect(removed.segments?.filter((s) => s.changed).map((s) => s.text)).toEqual(['quick'])
  })

  it('keeps everything when nothing changed', () => {
    const { items, additions } = computeDiff('same\n', 'same\n')
    expect(additions).toBe(0)
    expect(items).toHaveLength(1)
  })

  it('pairs removed and added lines side by side', () => {
    const { items } = computeDiff('a\nb\n', 'x\nb\n')
    const rows = toSplitRows(items.filter((i): i is DiffLine => i.type !== 'gap'))
    expect(rows[0]?.left?.text).toBe('a')
    expect(rows[0]?.right?.text).toBe('x')
    expect(rows[1]?.left).toBe(rows[1]?.right)
  })
})

describe('DiffViewer', () => {
  const before = lines(20).join('\n')
  const after = lines(20)
    .map((l, i) => (i === 10 ? 'line eleven' : l))
    .join('\n')

  it('shows totals, folds unchanged lines and expands them', async () => {
    renderWithGlyph(<DiffViewer oldValue={before} newValue={after} fileName="notes.txt" />)
    expect(screen.getByText('1 line added, 1 removed')).toBeInTheDocument()
    const region = screen.getByRole('region', { name: 'Changes to notes.txt' })
    expect(within(region).getByText('Removed:')).toBeInTheDocument()
    const expand = within(region).getAllByRole('button', { name: /Show \d+ unchanged lines/ })
    await userEvent.click(expand[0] as HTMLElement)
    expect(within(region).getByText('line 1')).toBeInTheDocument()
  })

  it('switches to side by side', async () => {
    renderWithGlyph(<DiffViewer oldValue={before} newValue={after} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Split' }))
    expect(screen.getByRole('columnheader', { name: 'Before' })).toBeInTheDocument()
  })

  it('says when there are no changes', () => {
    renderWithGlyph(<DiffViewer oldValue="x" newValue="x" />)
    expect(screen.getByText('No changes.')).toBeInTheDocument()
  })
})
