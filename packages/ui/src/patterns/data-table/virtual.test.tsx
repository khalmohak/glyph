import { render, renderHook, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GlyphProvider } from '../../provider/glyph-provider'
import { createColumnHelper, DataTable, type DataTableVirtualizer } from './index'
import { virtualRows } from './virtual'

interface Item {
  id: number
  name: string
}
const items: Item[] = Array.from({ length: 10_000 }, (_, id) => ({ id, name: `Item ${id}` }))
const col = createColumnHelper<Item>()
const columns = [col.accessor('id', { header: 'Id' }), col.accessor('name', { header: 'Name' })]

describe('virtualized rows', () => {
  it('renders only the rows the virtualizer asks for, with spacers for the rest', () => {
    const useVirtualRows = vi.fn(({ estimateSize }: { estimateSize: number }) => ({
      items: Array.from({ length: 20 }, (_, i) => ({
        index: 100 + i,
        start: (100 + i) * estimateSize,
        end: (101 + i) * estimateSize,
        key: 100 + i,
      })),
      totalSize: items.length * estimateSize,
      measureElement: () => {},
    }))
    const virtualizer: DataTableVirtualizer = { height: 400, useVirtualRows }
    render(
      <GlyphProvider storageKey={null} motion="none">
        <DataTable
          aria-label="Items"
          data={items}
          columns={columns}
          pageSize={false}
          virtualize={virtualizer}
        />
      </GlyphProvider>,
    )
    const table = screen.getByRole('table', { name: 'Items' })
    expect(table).toHaveAttribute('aria-rowcount', '10001')
    const rows = within(within(table).getAllByRole('rowgroup')[1]!).getAllByRole('row')
    expect(rows).toHaveLength(20)
    expect(rows[0]).toHaveTextContent('Item 100')
    expect(rows[0]).toHaveAttribute('aria-rowindex', '102')
    const spacers = table.querySelectorAll('tbody tr[aria-hidden="true"]')
    expect(spacers).toHaveLength(2)
    expect((spacers[0] as HTMLElement).style.height).toBe(`${100 * 41}px`)
    expect(useVirtualRows).toHaveBeenCalledWith(
      expect.objectContaining({ count: 10_000, estimateSize: 41 }),
    )
    expect(screen.getByRole('table').parentElement).toHaveStyle({ maxHeight: '400px' })
  })

  it('wraps @tanstack/react-virtual', () => {
    const virtual = virtualRows({ height: 320, overscan: 4 })
    expect(virtual.height).toBe(320)
    const element = document.createElement('div')
    const { result } = renderHook(() =>
      virtual.useVirtualRows({
        count: 50,
        getScrollElement: () => element,
        estimateSize: 40,
        scrollMargin: 40,
      }),
    )
    expect(result.current.totalSize).toBe(50 * 40)
    expect(typeof result.current.measureElement).toBe('function')
  })
})
