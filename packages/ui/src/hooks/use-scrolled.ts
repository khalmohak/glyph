import { useEffect, useState } from 'react'

/** True once the window has scrolled past `threshold` pixels. */
export function useScrolled(threshold = 8, enabled = true): boolean {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    if (!enabled) return
    const update = () => setScrolled(window.scrollY > threshold)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [threshold, enabled])
  return scrolled
}
