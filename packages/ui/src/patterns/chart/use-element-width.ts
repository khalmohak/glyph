import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Measures an element's content width with a ResizeObserver. Until the first measurement
 * (and in environments without layout, like tests) it reports `fallback`.
 */
export function useElementWidth<E extends HTMLElement>(fallback = 480) {
  const ref = useRef<E>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => setWidth(Math.round(element.getBoundingClientRect().width))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return [ref, width > 0 ? width : fallback] as const
}
