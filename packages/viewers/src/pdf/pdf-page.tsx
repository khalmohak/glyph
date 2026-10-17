import { cn, Skeleton } from '@glyphui/ui'
import { memo, useEffect, useRef, useState } from 'react'
import { CSS_UNITS, loadPdfjs, markMatches, type PageSize, type PdfDocument } from './pdfjs'

export interface PdfPageViewProps {
  pdf: PdfDocument
  pageNumber: number
  /** Zoom: 1 is the page's real size. */
  zoom: number
  rotation: number
  /** Size in points at zoom 1, before rotation. */
  size: PageSize
  /** Render the canvas and text layer. Off-screen pages only reserve space. */
  render: boolean
  query: string
  /** Index of the current match on this page, or -1. */
  activeMatch: number
  className?: string
}

/** Page box size in CSS px, after zoom and rotation. */
export function pageBox(size: PageSize, zoom: number, rotation: number) {
  const turned = rotation % 180 !== 0
  const w = (turned ? size.height : size.width) * zoom * CSS_UNITS
  const h = (turned ? size.width : size.height) * zoom * CSS_UNITS
  return { width: Math.floor(w), height: Math.floor(h) }
}

/** One PDF page: a canvas at device resolution with a selectable, searchable text layer. */
export const PdfPageView = memo(function PdfPageView({
  pdf,
  pageNumber,
  zoom,
  rotation,
  size,
  render,
  query,
  activeMatch,
  className,
}: PdfPageViewProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const text = useRef<HTMLDivElement>(null)
  const [painted, setPainted] = useState(false)
  const [textVersion, setTextVersion] = useState(0)
  const marks = useRef<HTMLElement[]>([])
  const box = pageBox(size, zoom, rotation)

  useEffect(() => {
    if (!render) {
      setPainted(false)
      return
    }
    let cancelled = false
    let renderTask: { cancel: () => void; promise: Promise<unknown> } | undefined
    let textLayer: { cancel: () => void } | undefined
    ;(async () => {
      const [lib, page] = await Promise.all([loadPdfjs(), pdf.getPage(pageNumber)])
      if (cancelled || !canvas.current || !text.current) return
      const viewport = page.getViewport({
        scale: zoom * CSS_UNITS,
        rotation: (page.rotate + rotation) % 360,
      })
      const ratio = Math.min(globalThis.devicePixelRatio || 1, 3)
      const el = canvas.current
      el.width = Math.floor(viewport.width * ratio)
      el.height = Math.floor(viewport.height * ratio)
      const context = el.getContext('2d')
      if (!context) return
      renderTask = page.render({
        canvas: el,
        canvasContext: context,
        viewport,
        ...(ratio !== 1 && { transform: [ratio, 0, 0, ratio, 0, 0] }),
      })
      await renderTask.promise
      if (cancelled) return
      setPainted(true)
      const container = text.current
      container.replaceChildren()
      container.style.setProperty('--total-scale-factor', String(viewport.scale))
      const layer = new lib.TextLayer({
        textContentSource: page.streamTextContent(),
        container,
        viewport,
      })
      textLayer = layer
      await layer.render()
      if (!cancelled) setTextVersion((v) => v + 1)
    })().catch(() => {
      // Cancelled renders reject; anything else leaves the placeholder showing.
    })
    return () => {
      cancelled = true
      renderTask?.cancel()
      textLayer?.cancel()
    }
  }, [pdf, pageNumber, zoom, rotation, render])

  // Mark search matches whenever the text layer or the query changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: textVersion signals a new text layer
  useEffect(() => {
    if (!text.current) return
    marks.current = markMatches(text.current, query)
  }, [query, textVersion])

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run after marks are rebuilt
  useEffect(() => {
    marks.current.forEach((mark, i) => {
      if (i === activeMatch) {
        mark.setAttribute('data-current', '')
        mark.scrollIntoView?.({ block: 'center', inline: 'nearest' })
      } else mark.removeAttribute('data-current')
    })
  }, [activeMatch, query, textVersion])

  return (
    // biome-ignore lint/a11y/useSemanticElements: a page, not a form fieldset
    <div
      data-page-number={pageNumber}
      // A group, not an image: the text layer inside keeps the page readable by screen readers.
      role="group"
      aria-roledescription="page"
      aria-label={`Page ${pageNumber}`}
      className={cn(
        'relative mx-auto shrink-0 overflow-hidden bg-white shadow-md ring-1 ring-black/5',
        className,
      )}
      style={{ width: box.width, height: box.height }}
    >
      <canvas ref={canvas} className={cn('block size-full', !painted && 'invisible')} />
      {/* The text layer keeps the page's words selectable and findable. */}
      <div ref={text} className="glyph-pdf-text" role="presentation" />
      {render && !painted && <Skeleton className="absolute inset-0 rounded-none bg-neutral-100" />}
    </div>
  )
})

/** A small rendering of a page for the thumbnails sidebar. Renders when scrolled into view. */
export const PdfThumbnail = memo(function PdfThumbnail({
  pdf,
  pageNumber,
  size,
  rotation,
  width = 112,
}: {
  pdf: PdfDocument
  pageNumber: number
  size: PageSize
  rotation: number
  width?: number
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(typeof IntersectionObserver === 'undefined')
  const turned = rotation % 180 !== 0
  const ratio = (turned ? size.width : size.height) / (turned ? size.height : size.width)
  const height = Math.round(width * ratio)

  useEffect(() => {
    const el = canvas.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    let task: { cancel: () => void; promise: Promise<unknown> } | undefined
    ;(async () => {
      const page = await pdf.getPage(pageNumber)
      const el = canvas.current
      if (cancelled || !el) return
      const base = page.getViewport({ scale: 1, rotation: (page.rotate + rotation) % 360 })
      const dpr = Math.min(globalThis.devicePixelRatio || 1, 2)
      const viewport = page.getViewport({
        scale: (width / base.width) * dpr,
        rotation: (page.rotate + rotation) % 360,
      })
      el.width = Math.floor(viewport.width)
      el.height = Math.floor(viewport.height)
      const context = el.getContext('2d')
      if (!context) return
      task = page.render({ canvas: el, canvasContext: context, viewport })
      await task.promise
    })().catch(() => {})
    return () => {
      cancelled = true
      task?.cancel()
    }
  }, [pdf, pageNumber, rotation, visible, width])

  return (
    <canvas
      ref={canvas}
      className="block bg-white shadow-sm ring-1 ring-black/10"
      style={{ width, height }}
    />
  )
})
