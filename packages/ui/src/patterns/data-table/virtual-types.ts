import type { Key } from 'react'

export interface VirtualRowsOptions {
  count: number
  getScrollElement: () => HTMLElement | null
  /** Expected row height in pixels; rows are measured once rendered. */
  estimateSize: number
  /** Space above the rows inside the scroll element (the sticky header). */
  scrollMargin: number
}

export interface VirtualRowsResult {
  items: readonly { index: number; start: number; end: number; key: Key }[]
  totalSize: number
  measureElement: (element: Element | null) => void
}

/**
 * Renders only the rows in view. Create one with `virtualRows()` from
 * `@glyphui/ui/data-table/virtual` and pass it to DataTable's `virtualize`.
 */
export interface DataTableVirtualizer {
  /** Height of the scrolling area. */
  height: number | string
  /** A React hook; DataTable calls it on every render while virtualized. */
  useVirtualRows: (options: VirtualRowsOptions) => VirtualRowsResult
}
