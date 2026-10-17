import type { Row } from '@tanstack/react-table'
import { type ReactNode, useLayoutEffect, useState } from 'react'
import type { Density } from './types'
import type { DataTableVirtualizer } from './virtual-types'

const rowHeight: Record<Density, number> = { compact: 33, default: 41, comfortable: 49 }

/** Renders the visible slice of `rows` between two spacer rows that keep the scroll height. */
export function VirtualRows<T>({
  virtualizer,
  rows,
  columnCount,
  density,
  getScrollElement,
  getTableElement,
  renderRow,
}: {
  virtualizer: DataTableVirtualizer
  rows: Row<T>[]
  columnCount: number
  density: Density
  getScrollElement: () => HTMLElement | null
  getTableElement: () => HTMLTableElement | null
  renderRow: (row: Row<T>, measure: (el: Element | null) => void, index: number) => ReactNode
}) {
  // The sticky header sits above the rows inside the scroll area. Measuring it also
  // re-renders once after mount: on the first render the scroller's ref isn't attached
  // yet (child layout effects run first), so the virtualizer has nothing to observe.
  const [layout, setLayout] = useState({ mounted: false, headerHeight: 40 })
  useLayoutEffect(() => {
    setLayout({ mounted: true, headerHeight: getTableElement()?.tHead?.offsetHeight ?? 40 })
  }, [getTableElement])
  const headerHeight = layout.headerHeight

  const { items, totalSize, measureElement } = virtualizer.useVirtualRows({
    count: rows.length,
    getScrollElement,
    estimateSize: rowHeight[density],
    scrollMargin: headerHeight,
  })
  const top = items[0]?.start ?? 0
  const bottom = totalSize - (items.at(-1)?.end ?? 0)
  const spacer = (height: number, key: string) =>
    height > 0 ? (
      // biome-ignore lint/a11y/noAriaHiddenOnFocusable: spacer rows hold no content; aria-rowindex keeps the count right
      <tr key={key} aria-hidden="true" style={{ height }}>
        <td colSpan={columnCount} className="p-0" />
      </tr>
    ) : null

  return (
    <>
      {spacer(top, 'top')}
      {items.map((item) => {
        const row = rows[item.index]
        return row ? renderRow(row, measureElement, item.index) : null
      })}
      {spacer(bottom, 'bottom')}
    </>
  )
}
