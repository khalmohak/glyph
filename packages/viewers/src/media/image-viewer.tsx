import { cn, tv, useComponentConfig } from '@glyphui/ui'
import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { download, useFullscreen } from '../internal/browser'
import {
  heightStyle,
  type StylesEntry,
  ToolButton,
  ViewerStatus,
  viewerFrameStyles,
} from '../internal/frame'
import {
  DownloadIcon,
  FitIcon,
  MaximizeIcon,
  MinimizeIcon,
  ResetIcon,
  RotateIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '../internal/icons'
import { sourceName, sourceUrl, type ViewerSource } from '../internal/source'
import { useViewersStylesCheck } from '../internal/styles-check'

export const imageViewerStyles = /* @__PURE__ */ tv({
  extend: viewerFrameStyles,
  slots: {
    stage:
      'relative h-full touch-none overflow-hidden bg-[repeating-conic-gradient(var(--glyph-muted)_0_25%,transparent_0_50%)] bg-[length:16px_16px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
    image:
      'absolute top-1/2 left-1/2 max-w-none origin-center select-none will-change-transform [-webkit-user-drag:none]',
    zoom: 'min-w-12 text-center text-caption text-muted-foreground tabular-nums',
  },
  variants: {
    dragging: { true: { stage: 'cursor-grabbing' }, false: { stage: 'cursor-grab' } },
    animate: {
      true: { image: 'transition-transform duration-(--glyph-duration-base) ease-standard' },
    },
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    ImageViewer: StylesEntry<typeof imageViewerStyles>
  }
}

export interface ImageViewerProps {
  /** The image: a URL, a File/Blob, or bytes. */
  source: ViewerSource
  /** Alternative text. Required for meaningful images. */
  alt: string
  /** Height of the viewer. Default 420. */
  height?: number | string
  /** Zoom limits, as a scale of the natural size. Default 0.05–16. */
  minZoom?: number
  maxZoom?: number
  /** Show a download button. Default true. */
  downloadable?: boolean
  /** Draw the viewer as a bordered card. Default true. */
  bordered?: boolean
  className?: string
}

interface View {
  scale: number
  x: number
  y: number
  rotation: number
}

/**
 * An image you can zoom (buttons, ⌘/Ctrl + wheel, pinch), pan (drag), rotate and reset.
 * Keyboard: + and − zoom, 0 fits, 1 shows actual size, R rotates, arrows pan.
 */
export function ImageViewer(inProps: ImageViewerProps) {
  const [props, slots] = useComponentConfig('ImageViewer', inProps)
  const {
    source,
    alt,
    height = 420,
    minZoom = 0.05,
    maxZoom = 16,
    downloadable = true,
    bordered = true,
    className,
  } = props
  useViewersStylesCheck()
  const root = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [url, setUrl] = useState<string>()
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const [failed, setFailed] = useState(false)
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0, rotation: 0 })
  const [animate, setAnimate] = useState(false)
  const [dragging, setDragging] = useState(false)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ distance: number; scale: number } | null>(null)
  const fullscreen = useFullscreen(useCallback(() => root.current, []))
  const s = imageViewerStyles({ bordered, dragging, animate })

  useEffect(() => {
    const { url, revoke } = sourceUrl(source)
    setUrl(url)
    setNatural(null)
    setFailed(false)
    return revoke
  }, [source])

  const fitScale = useCallback(
    (rotation = view.rotation) => {
      const el = stage.current
      if (!el || !natural) return 1
      const turned = rotation % 180 !== 0
      const w = turned ? natural.h : natural.w
      const h = turned ? natural.w : natural.h
      const pad = 24
      return Math.min(1, (el.clientWidth - pad) / w, (el.clientHeight - pad) / h)
    },
    [natural, view.rotation],
  )

  const clamp = (scale: number) => Math.min(maxZoom, Math.max(minZoom, scale))
  const fit = useCallback(() => {
    setAnimate(true)
    setView((v) => ({ ...v, scale: fitScale(), x: 0, y: 0 }))
  }, [fitScale])

  // Fit once the image's size is known, and when the stage resizes.
  useEffect(() => {
    if (!natural) return
    setView((v) => ({ ...v, scale: fitScale(v.rotation), x: 0, y: 0 }))
    const el = stage.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() =>
      setView((v) => ({ ...v, scale: Math.min(v.scale, maxZoom) })),
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [natural, fitScale, maxZoom])

  /** Zooms by `factor`, keeping the point (px from the stage center) under the cursor fixed. */
  const zoomBy = (factor: number, at = { x: 0, y: 0 }) => {
    setView((v) => {
      const scale = clamp(v.scale * factor)
      const k = scale / v.scale
      return { ...v, scale, x: at.x - (at.x - v.x) * k, y: at.y - (at.y - v.y) * k }
    })
  }

  // Plain wheel scrolls the page; ⌘/Ctrl + wheel (and trackpad pinch) zooms. React's wheel
  // listeners are passive, so the browser's own page zoom can only be stopped natively.
  const zoomRef = useRef(zoomBy)
  zoomRef.current = zoomBy
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-attach when the stage mounts
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      const rect = el.getBoundingClientRect()
      setAnimate(false)
      zoomRef.current(Math.exp(-event.deltaY * 0.01), {
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2,
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [failed])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    setAnimate(false)
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [
        { x: number; y: number },
        { x: number; y: number },
      ]
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale: view.scale }
    } else setDragging(true)
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const last = pointers.current.get(event.pointerId)
    if (!last) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [
        { x: number; y: number },
        { x: number; y: number },
      ]
      const ratio = Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.distance
      const scale = clamp(pinch.current.scale * ratio)
      setView((v) => ({ ...v, scale }))
      return
    }
    const dx = event.clientX - last.x
    const dy = event.clientY - last.y
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
  }
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size < 2) pinch.current = null
    if (pointers.current.size === 0) setDragging(false)
  }

  const rotate = () => {
    setAnimate(true)
    setView((v) => {
      const rotation = (v.rotation + 90) % 360
      return { ...v, rotation, scale: fitScale(rotation), x: 0, y: 0 }
    })
  }
  const actualSize = () => {
    setAnimate(true)
    setView((v) => ({ ...v, scale: 1, x: 0, y: 0 }))
  }
  const reset = () => {
    setAnimate(true)
    setView({ rotation: 0, scale: fitScale(0), x: 0, y: 0 })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = 40
    const actions: Record<string, () => void> = {
      '+': () => zoomBy(1.25),
      '=': () => zoomBy(1.25),
      '-': () => zoomBy(0.8),
      '0': fit,
      '1': actualSize,
      r: rotate,
      R: rotate,
      ArrowLeft: () => setView((v) => ({ ...v, x: v.x + step })),
      ArrowRight: () => setView((v) => ({ ...v, x: v.x - step })),
      ArrowUp: () => setView((v) => ({ ...v, y: v.y + step })),
      ArrowDown: () => setView((v) => ({ ...v, y: v.y - step })),
    }
    const action = actions[event.key]
    if (!action) return
    event.preventDefault()
    setAnimate(true)
    action()
  }

  const name = sourceName(source) ?? 'image'
  return (
    <div
      ref={root}
      data-slot="image-viewer"
      className={cn(s.root({ class: slots.root }), className)}
      style={fullscreen.active ? undefined : heightStyle(height)}
    >
      <div role="toolbar" aria-label="Image tools" className={s.toolbar({ class: slots.toolbar })}>
        <ToolButton
          label="Zoom out"
          shortcut="−"
          icon={<ZoomOutIcon />}
          onClick={() => {
            setAnimate(true)
            zoomBy(0.8)
          }}
        />
        <span className={s.zoom({ class: slots.zoom })} aria-live="polite">
          {Math.round(view.scale * 100)}%
        </span>
        <ToolButton
          label="Zoom in"
          shortcut="+"
          icon={<ZoomInIcon />}
          onClick={() => {
            setAnimate(true)
            zoomBy(1.25)
          }}
        />
        <span className={s.divider({ class: slots.divider })} />
        <ToolButton label="Fit to view" shortcut="0" icon={<FitIcon />} onClick={fit} />
        <ToolButton
          label="Actual size"
          shortcut="1"
          icon={<span className="font-mono text-[0.6875rem] font-semibold">1:1</span>}
          onClick={actualSize}
        />
        <ToolButton label="Rotate" shortcut="R" icon={<RotateIcon />} onClick={rotate} />
        <ToolButton label="Reset" icon={<ResetIcon />} onClick={reset} />
        <span className={s.spacer({ class: slots.spacer })} />
        {downloadable && (
          <ToolButton
            label="Download"
            icon={<DownloadIcon />}
            onClick={() => download(source, name)}
          />
        )}
        {fullscreen.supported && (
          <ToolButton
            label={fullscreen.active ? 'Exit fullscreen' : 'Fullscreen'}
            icon={fullscreen.active ? <MinimizeIcon /> : <MaximizeIcon />}
            onClick={fullscreen.toggle}
          />
        )}
      </div>
      <div className={s.body({ class: slots.body })}>
        {failed ? (
          <ViewerStatus status="error" error={new Error('This image could not be loaded.')} />
        ) : (
          <div
            ref={stage}
            role="img"
            aria-label={alt}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: the stage takes zoom and pan keys
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
            onDoubleClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect()
              setAnimate(true)
              zoomBy(view.scale < fitScale() * 1.5 ? 2 : fitScale() / view.scale, {
                x: event.clientX - rect.left - rect.width / 2,
                y: event.clientY - rect.top - rect.height / 2,
              })
            }}
            className={s.stage({ class: slots.stage })}
          >
            {url && (
              <img
                src={url}
                alt=""
                draggable={false}
                onLoad={(event) =>
                  setNatural({
                    w: event.currentTarget.naturalWidth,
                    h: event.currentTarget.naturalHeight,
                  })
                }
                onError={() => setFailed(true)}
                onTransitionEnd={() => setAnimate(false)}
                className={s.image({ class: slots.image })}
                style={{
                  transform: `translate(-50%, -50%) translate(${view.x}px, ${view.y}px) rotate(${view.rotation}deg) scale(${view.scale})`,
                  opacity: natural ? 1 : 0,
                }}
              />
            )}
            {!natural && !failed && <ViewerStatus status="loading" className="absolute inset-0" />}
          </div>
        )}
      </div>
    </div>
  )
}
