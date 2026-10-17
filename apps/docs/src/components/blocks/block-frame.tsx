import { Skeleton } from '@glyphui/ui'
import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react'
import type { BlockFrameMessage } from '../../pages/block-frame'

interface BlockFrameProps {
  slug: string
  file: string
  title: string
  /** Width the block lays out at, in px. */
  width: number
  onWidthChange: (width: number) => void
}

const MIN_WIDTH = 320

/**
 * A block in an iframe at a chosen width, so its breakpoints respond as they would on that
 * device. The frame loads when scrolled near, sizes itself to the content, and its right edge
 * can be dragged (or moved with the arrow keys) to any width.
 */
export function BlockFrame({ slug, file, title, width, onWidthChange }: BlockFrameProps) {
  const wrapper = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const [near, setNear] = useState(false)
  const [height, setHeight] = useState<number | null>(null)
  const [available, setAvailable] = useState(1280)

  // Load only when close to the viewport: a page of iframes is expensive.
  useEffect(() => {
    const el = wrapper.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // The space the frame can use; widths beyond it scroll sideways.
  useEffect(() => {
    const el = wrapper.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setAvailable(Math.floor(entry.contentRect.width))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Height reports from this frame only.
  useEffect(() => {
    const onMessage = (event: MessageEvent<BlockFrameMessage>) => {
      if (event.source !== frame.current?.contentWindow) return
      if (event.data?.type === 'glyph:block-frame-height') setHeight(event.data.height)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = width
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    // The iframe would swallow pointer events mid-drag.
    if (frame.current) frame.current.style.pointerEvents = 'none'
    const move = (e: PointerEvent) =>
      onWidthChange(Math.max(MIN_WIDTH, Math.round(startWidth + (e.clientX - startX))))
    const up = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', up)
      if (frame.current) frame.current.style.pointerEvents = ''
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', up)
  }

  const src = `${import.meta.env.BASE_URL}blocks/frame/?slug=${encodeURIComponent(slug)}&file=${encodeURIComponent(file)}`

  return (
    <div className="grid gap-2">
      <div ref={wrapper} className="min-w-0 overflow-x-auto rounded-lg bg-subtle">
        <div className="relative mx-auto" style={{ width: Math.max(width, MIN_WIDTH) }}>
          <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
            {near ? (
              <iframe
                ref={frame}
                title={title}
                src={src}
                loading="lazy"
                data-testid={`block-frame-${slug}-${file}`}
                className="block w-full border-0"
                style={{ height: height ?? 360 }}
              />
            ) : (
              <Skeleton className="h-[360px] w-full rounded-none" />
            )}
          </div>
          {/* biome-ignore lint/a11y/useSemanticElements: a draggable splitter has no native element */}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={`Resize ${title} preview`}
            aria-valuenow={width}
            aria-valuemin={MIN_WIDTH}
            aria-valuemax={Math.max(available, width)}
            tabIndex={0}
            onPointerDown={startResize}
            onKeyDown={(event) => {
              const step = event.shiftKey ? 100 : 20
              if (event.key === 'ArrowLeft') onWidthChange(Math.max(MIN_WIDTH, width - step))
              else if (event.key === 'ArrowRight') onWidthChange(width + step)
              else return
              event.preventDefault()
            }}
            className="absolute top-0 -right-3 flex h-full w-3 cursor-ew-resize items-center justify-center rounded-r-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden="true" className="h-8 w-1 rounded-pill bg-border-strong" />
          </div>
        </div>
      </div>
      <p className="text-center font-mono text-caption text-muted-foreground">
        {Math.max(width, MIN_WIDTH)} px · drag the edge to resize
      </p>
    </div>
  )
}
