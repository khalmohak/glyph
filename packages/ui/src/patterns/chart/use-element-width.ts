import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Measures an element's content width with a ResizeObserver. Until the first measurement
 * (and in environments without layout, like tests) it reports `fallback`.
 *
 * Returns a callback ref, so an element that only appears later (after a loading or empty
 * state) is measured as soon as it mounts.
 */
export function useElementWidth<E extends HTMLElement>(fallback = 480) {
  const [width, setWidth] = useState(0)
  const stop = useRef<(() => void) | null>(null)
  const ref = useCallback((element: E | null) => {
    stop.current?.()
    stop.current = null
    if (!element) return
    const measure = () => setWidth(Math.round(element.getBoundingClientRect().width))
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    stop.current = () => observer.disconnect()
  }, [])
  useEffect(() => () => stop.current?.(), [])
  return [ref, width > 0 ? width : fallback] as const
}
