import { Skeleton } from '@glyphui/ui'
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ErrorBoundary } from './error-boundary'
import { previewFor } from './example-view'

/** Width examples lay out at. Wide enough for tables and charts. */
const LAYOUT_WIDTH = 640
/** Breathing room around the content inside the thumbnail, in px. */
const INSET = 20
/** Small components show at full size, never blown up. */
const MAX_SCALE = 1

interface ScaledPreviewProps {
  slug: string
  file: string
  className?: string
}

interface Fit {
  scale: number
  x: number
  y: number
}

const transparent = /^(transparent|rgba\(0, 0, 0, 0\))$/

/** True when an element paints something itself: text, an icon, a fill, a border or a shadow. */
function draws(el: Element) {
  if (el.childElementCount === 0) return true
  const style = getComputedStyle(el)
  if (!transparent.test(style.backgroundColor)) return true
  if (style.boxShadow !== 'none') return true
  return ['Top', 'Right', 'Bottom', 'Left'].some(
    (side) =>
      Number.parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0 &&
      !transparent.test(style.getPropertyValue(`border-${side.toLowerCase()}-color`)),
  )
}

/**
 * The union of everything visible inside `root`, relative to `root` at scale 1. Layout-only
 * wrappers (a full-width flex row around one button) are skipped, so the frame hugs what the
 * example actually draws.
 */
function contentBounds(root: HTMLElement, scale: number) {
  const origin = root.getBoundingClientRect()
  let left = Number.POSITIVE_INFINITY
  let top = Number.POSITIVE_INFINITY
  let right = Number.NEGATIVE_INFINITY
  let bottom = Number.NEGATIVE_INFINITY
  for (const el of root.querySelectorAll('*')) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0 || !draws(el)) continue
    left = Math.min(left, r.left)
    top = Math.min(top, r.top)
    right = Math.max(right, r.right)
    bottom = Math.max(bottom, r.bottom)
  }
  if (!Number.isFinite(left)) return null
  return {
    x: (left - origin.left) / scale,
    y: (top - origin.top) / scale,
    width: (right - left) / scale,
    height: (bottom - top) / scale,
  }
}

/**
 * A live, non-interactive thumbnail of an example, framed around what the example actually
 * draws: a button shows at full size, a data table scales down to fit. It mounts only once it
 * nears the viewport, so a page of 130 previews stays fast, and it's inert and hidden from
 * assistive tech (the card it sits in carries the name).
 */
export function ScaledPreview({ slug, file, className }: ScaledPreviewProps) {
  const box = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [fit, setFit] = useState<Fit | null>(null)
  const fitRef = useRef<Fit | null>(null)

  const measure = useCallback(() => {
    const frame = box.current
    const inner = content.current
    if (!frame || !inner) return
    const bounds = contentBounds(inner, fitRef.current?.scale ?? 1)
    if (!bounds) return
    const scale = Math.min(
      MAX_SCALE,
      (frame.clientWidth - INSET * 2) / bounds.width,
      (frame.clientHeight - INSET * 2) / bounds.height,
    )
    const next = {
      scale,
      x: (frame.clientWidth - bounds.width * scale) / 2 - bounds.x * scale,
      y: (frame.clientHeight - bounds.height * scale) / 2 - bounds.y * scale,
    }
    const prev = fitRef.current
    if (
      prev &&
      Math.abs(prev.scale - next.scale) < 0.005 &&
      Math.abs(prev.x - next.x) < 0.5 &&
      Math.abs(prev.y - next.y) < 0.5
    )
      return
    fitRef.current = next
    setFit(next)
  }, [])

  // Mount the example once the card nears the viewport.
  useEffect(() => {
    const el = box.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        setVisible(true)
        io.disconnect()
      },
      { rootMargin: '300px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Re-frame whenever the card or the example's content changes size (charts and lazy parts
  // settle after the first paint).
  useLayoutEffect(() => {
    if (!visible) return
    const frame = box.current
    const inner = content.current
    if (!frame || !inner) return
    measure()
    const timers = [120, 400, 1200].map((ms) => window.setTimeout(measure, ms))
    if (typeof ResizeObserver === 'undefined') return () => timers.forEach(clearTimeout)
    const ro = new ResizeObserver(() => measure())
    ro.observe(frame)
    ro.observe(inner)
    return () => {
      ro.disconnect()
      for (const t of timers) clearTimeout(t)
    }
  }, [visible, measure])

  const Preview = visible ? previewFor(slug, file) : null

  return (
    <div
      ref={box}
      aria-hidden="true"
      className={['relative aspect-[16/10] overflow-hidden', className].filter(Boolean).join(' ')}
    >
      {Preview ? (
        <div
          ref={content}
          inert
          data-preview
          className="pointer-events-none absolute top-0 left-0 origin-top-left"
          style={{
            width: LAYOUT_WIDTH,
            transform: fit ? `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})` : undefined,
            // Hidden until framed, so it never flashes at full size.
            visibility: fit ? 'visible' : 'hidden',
          }}
        >
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <div className="flex justify-center">
                <Preview />
              </div>
            </Suspense>
          </ErrorBoundary>
        </div>
      ) : null}
      {!fit && (
        <div className="absolute inset-0 grid place-items-center">
          <Skeleton className="h-1/4 w-1/2" />
        </div>
      )}
    </div>
  )
}
