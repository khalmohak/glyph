import { useSyncExternalStore } from 'react'

let version = 0
const listeners = new Set<() => void>()
let attached = false

function bump() {
  version += 1
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!attached && typeof document !== 'undefined' && 'fonts' in document) {
    attached = true
    // Web fonts can finish loading after first render; anything measured with them before
    // that (canvas text widths, header widths) must be measured again.
    document.fonts.addEventListener('loadingdone', bump)
    void document.fonts.ready.then(bump)
  }
  return () => listeners.delete(listener)
}

/**
 * A number that changes whenever web fonts finish loading. Components that measure text
 * call it so they re-render, and re-measure, once the real font is in place.
 */
export function useFontsVersion(): number {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  )
}
