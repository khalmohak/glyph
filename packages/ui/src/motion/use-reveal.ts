import { type RefObject, useEffect, useLayoutEffect } from 'react'
import { useMotionSettings } from './use-motion-settings'

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export interface RevealOptions {
  /** Animate only the first time it scrolls into view. Default true. */
  once?: boolean | undefined
  /** Share of the element that must be visible, 0–1. Default 0.15. */
  amount?: number | undefined
  /** Set false to show the content without animating. */
  enabled?: boolean | undefined
}

/**
 * Drives a `data-<attribute>="hidden|shown"` attribute from an IntersectionObserver.
 *
 * Content stays visible unless everything needed to reveal it is available: motion is on,
 * the browser has IntersectionObserver, and JavaScript ran. Server HTML, tests and
 * reduced-motion visitors always get visible content.
 */
export function useReveal(
  ref: RefObject<HTMLElement | null>,
  attribute: 'reveal' | 'stagger',
  { once = true, amount = 0.15, enabled = true }: RevealOptions = {},
): void {
  const { animate } = useMotionSettings()
  const active = enabled && animate

  // Hide before the first paint, so in-view content animates in instead of flashing.
  useIsomorphicLayoutEffect(() => {
    const el = ref.current
    if (!el || !active || typeof IntersectionObserver === 'undefined') return
    const key = `data-${attribute}`
    el.setAttribute(key, 'hidden')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          el.setAttribute(key, 'shown')
          if (once) observer.disconnect()
        } else if (!once) {
          el.setAttribute(key, 'hidden')
        }
      },
      { threshold: amount },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      el.removeAttribute(key)
    }
  }, [active, attribute, once, amount])
}
