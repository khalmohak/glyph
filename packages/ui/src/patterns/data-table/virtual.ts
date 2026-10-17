import { useVirtualizer } from '@tanstack/react-virtual'
import type { DataTableVirtualizer } from './virtual-types'

export type { DataTableVirtualizer, VirtualRowsOptions, VirtualRowsResult } from './virtual-types'

export interface VirtualRowsConfig {
  /** Height of the scrolling area. Default 480. */
  height?: number | string
  /** Rows rendered beyond each edge of the view. Default 10. */
  overscan?: number
}

/**
 * Virtualization for DataTable: only rows in view are in the DOM, so 10,000+ rows scroll
 * smoothly. Needs `@tanstack/react-virtual`.
 *
 * ```tsx
 * import { virtualRows } from '@glyphui/ui/data-table/virtual'
 *
 * const virtual = virtualRows({ height: 520 })
 * <DataTable data={rows} columns={columns} pageSize={false} virtualize={virtual} />
 * ```
 *
 * Create it once (outside the component or with `useMemo`).
 */
export function virtualRows({
  height = 480,
  overscan = 10,
}: VirtualRowsConfig = {}): DataTableVirtualizer {
  return {
    height,
    useVirtualRows: ({ count, getScrollElement, estimateSize, scrollMargin }) => {
      const virtualizer = useVirtualizer({
        count,
        getScrollElement,
        estimateSize: () => estimateSize,
        overscan,
        scrollMargin,
      })
      return {
        items: virtualizer.getVirtualItems().map((item) => ({
          index: item.index,
          start: item.start - scrollMargin,
          end: item.end - scrollMargin,
          key: item.key,
        })),
        totalSize: virtualizer.getTotalSize(),
        measureElement: virtualizer.measureElement,
      }
    },
  }
}
