import { useSyncExternalStore } from 'react'

/** Subscribes to a CSS media query. Returns `fallback` during SSR. */
export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  )
}
