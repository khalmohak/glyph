import { useCallback, useEffect, useState } from 'react'
import { sourceUrl, type ViewerSource } from './source'

/** Downloads a source under `fileName`. */
export function download(source: ViewerSource, fileName: string): void {
  const { url, revoke } = sourceUrl(source)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  document.body.append(link)
  link.click()
  link.remove()
  // Give the browser a moment to start the download before the object URL goes away.
  setTimeout(revoke, 1000)
}

/** Copies text to the clipboard. Resolves false when the browser refuses. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Fullscreen state for an element, following the document's fullscreen changes. */
export function useFullscreen(element: () => HTMLElement | null) {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const sync = () => setActive(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])
  const supported = typeof document !== 'undefined' && document.fullscreenEnabled === true
  const toggle = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void element()?.requestFullscreen()
  }, [element])
  return { active, supported, toggle }
}

/** True while `ms` has passed since the last call to `flash()`, e.g. a "Copied" check mark. */
export function useFlash(ms = 1500) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!on) return
    const timer = setTimeout(() => setOn(false), ms)
    return () => clearTimeout(timer)
  }, [on, ms])
  return [on, () => setOn(true)] as const
}
