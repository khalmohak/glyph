import { type RefObject, useCallback, useEffect, useState } from 'react'

export interface FixedVirtualList {
  /** First and last (exclusive) row index to render. */
  start: number
  end: number
  /** Total scroll height in px. */
  totalHeight: number
  /** Scrolls so row `index` is in view, if it isn't. */
  scrollToIndex: (index: number) => void
}

/**
 * Windowing for lists whose rows all have the same height: only rows in view (plus
 * `overscan` on each side) are rendered. Small, dependency-free, enough for trees and lists.
 */
export function useFixedVirtualList(
  viewport: RefObject<HTMLElement | null>,
  count: number,
  rowHeight: number,
  overscan = 8,
): FixedVirtualList {
  const [scrollTop, setScrollTop] = useState(0)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = viewport.current
    if (!el) return
    const onScroll = () => setScrollTop(el.scrollTop)
    const measure = () => setHeight(el.clientHeight)
    measure()
    el.addEventListener('scroll', onScroll, { passive: true })
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    observer?.observe(el)
    return () => {
      el.removeEventListener('scroll', onScroll)
      observer?.disconnect()
    }
  }, [viewport])

  // Before layout (or in jsdom) assume a tall viewport, so content renders.
  const visible = height > 0 ? Math.ceil(height / rowHeight) : 40
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const end = Math.min(count, start + visible + overscan * 2)

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = viewport.current
      if (!el) return
      const top = index * rowHeight
      if (top < el.scrollTop) el.scrollTop = top
      else if (top + rowHeight > el.scrollTop + el.clientHeight) {
        el.scrollTop = top + rowHeight - el.clientHeight
      }
      setScrollTop(el.scrollTop)
    },
    [viewport, rowHeight],
  )

  return { start, end, totalHeight: count * rowHeight, scrollToIndex }
}
