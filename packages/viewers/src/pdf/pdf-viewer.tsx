import {
  Button,
  cn,
  Input,
  PasswordInput,
  Progress,
  Select,
  SelectItem,
  tv,
  useComponentConfig,
  useMediaQuery,
} from '@glyphui/ui'
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
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
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DownloadIcon,
  LockIcon,
  MaximizeIcon,
  MinimizeIcon,
  PanelLeftIcon,
  PrinterIcon,
  RotateIcon,
  SearchIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '../internal/icons'
import { readBytes, sourceName, sourceUrl, type ViewerSource } from '../internal/source'
import { useViewersStylesCheck } from '../internal/styles-check'
import { PdfPageView, PdfThumbnail, pageBox } from './pdf-page'
import {
  countMatches,
  loadPdfjs,
  type PageSize,
  type PdfDocument,
  type PdfWorkerSource,
} from './pdfjs'

export const pdfViewerStyles = /* @__PURE__ */ tv({
  extend: viewerFrameStyles,
  slots: {
    // One row from `sm` up: the search field gives up width before anything wraps.
    toolbar: 'sm:flex-nowrap',
    // Phones: dividers go, and search takes its own full-width row.
    divider: 'max-sm:hidden',
    searchGroup: 'flex min-w-0 shrink items-center gap-1 max-sm:order-last max-sm:w-full',
    pageInput: 'w-12 text-center tabular-nums',
    pageCount: 'px-1 text-small whitespace-nowrap text-muted-foreground tabular-nums',
    zoomSelect: 'w-28 max-sm:hidden',
    search: 'w-48 min-w-28 shrink max-sm:flex-1',
    counter: 'min-w-14 text-caption text-muted-foreground tabular-nums',
    layout: 'flex h-full min-h-0',
    sidebar:
      'h-full w-40 shrink-0 overflow-y-auto border-r border-border bg-subtle p-3 max-sm:hidden',
    thumb:
      'group/thumb mb-3 grid w-full justify-items-center gap-1 rounded-lg p-1.5 text-caption text-muted-foreground tabular-nums outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[current]:bg-primary/10 data-[current]:text-foreground',
    pages:
      'relative h-full min-w-0 flex-1 overflow-auto bg-subtle outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
    password: 'mx-auto grid w-full max-w-xs gap-3 p-6 text-small',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    PdfViewer: StylesEntry<typeof pdfViewerStyles>
  }
}

export type PdfZoom = 'fit-width' | 'fit-page' | number

export interface PdfViewerProps {
  /** The PDF: a URL, a File/Blob, or bytes. */
  source: ViewerSource
  /** Starting zoom: `fit-width` (default), `fit-page`, or a scale where 1 is actual size. */
  defaultZoom?: PdfZoom
  /** Page to open on, from 1. */
  defaultPage?: number
  /** Show the thumbnails sidebar at first (wide screens). Default true. */
  thumbnails?: boolean
  /** Name for downloads. Defaults to the file or URL name. */
  fileName?: string
  /** Height of the viewer. Default 640. */
  height?: number | string
  /** pdf.js worker for this viewer. See `setPdfWorker` to set it once for the app. */
  workerSrc?: PdfWorkerSource
  /** Draw the viewer as a bordered card. Default true. */
  bordered?: boolean
  onLoad?: (info: { pages: number }) => void
  onPageChange?: (page: number) => void
  className?: string
}

const GAP = 16
const PAD = 16
const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]

type Load =
  | { status: 'loading'; progress: number | null }
  | { status: 'password'; retry: boolean; submit: (password: string) => void }
  | { status: 'error'; error: unknown }
  | { status: 'ready'; pdf: PdfDocument; sizes: PageSize[] }

/**
 * A PDF with page thumbnails, zoom, rotation, search with highlights, selectable text,
 * download, print and fullscreen. Long documents render only the pages in view.
 * Needs `pdfjs-dist`; its worker loads from jsDelivr unless you call `setPdfWorker`.
 */
export function PdfViewer(inProps: PdfViewerProps) {
  const [props, slots] = useComponentConfig('PdfViewer', inProps)
  const {
    source,
    defaultZoom = 'fit-width',
    defaultPage = 1,
    thumbnails: thumbnailsProp = true,
    fileName,
    height = 640,
    workerSrc,
    bordered = true,
    onLoad,
    onPageChange,
    className,
  } = props
  useViewersStylesCheck()
  const s = pdfViewerStyles({ bordered })
  const root = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const narrow = useMediaQuery('(max-width: 639px)')
  const [load, setLoad] = useState<Load>({ status: 'loading', progress: null })
  const [attempt, setAttempt] = useState(0)
  const [zoomMode, setZoomMode] = useState<PdfZoom>(defaultZoom)
  const [rotation, setRotation] = useState(0)
  const [page, setPage] = useState(defaultPage)
  const [pageDraft, setPageDraft] = useState(String(defaultPage))
  const [sidebar, setSidebar] = useState(thumbnailsProp)
  const [viewport, setViewport] = useState({ width: 0, height: 0, top: 0 })
  const [query, setQuery] = useState('')
  const [texts, setTexts] = useState<string[][] | null>(null)
  const [matchIndex, setMatchIndex] = useState(0)
  const fullscreen = useFullscreen(useCallback(() => root.current, []))
  const name = fileName ?? sourceName(source) ?? 'document.pdf'
  const onLoadRef = useRef(onLoad)
  onLoadRef.current = onLoad
  const onPageChangeRef = useRef(onPageChange)
  onPageChangeRef.current = onPageChange

  // Open the document.
  // biome-ignore lint/correctness/useExhaustiveDependencies: attempt retries
  useEffect(() => {
    let cancelled = false
    let task: { destroy: () => Promise<void> } | undefined
    let pdf: PdfDocument | undefined
    setLoad({ status: 'loading', progress: null })
    setTexts(null)
    setMatchIndex(0)
    ;(async () => {
      const lib = await loadPdfjs(workerSrc)
      const isUrl = typeof source === 'string' || source instanceof URL
      const params = isUrl
        ? { url: String(source) }
        : { data: new Uint8Array(await readBytes(source)) }
      // Unmounted or switched source while pdf.js or the bytes loaded: don't open it at all.
      if (cancelled) return
      const loadingTask = lib.getDocument(params)
      task = loadingTask
      loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
        if (!cancelled && total > 0) setLoad({ status: 'loading', progress: loaded / total })
      }
      loadingTask.onPassword = (update: (password: string) => void, reason: number) => {
        if (cancelled) return
        setLoad({
          status: 'password',
          retry: reason === lib.PasswordResponses.INCORRECT_PASSWORD,
          submit: (password) => {
            setLoad({ status: 'loading', progress: null })
            update(password)
          },
        })
      }
      pdf = await loadingTask.promise
      // Page sizes for layout: fetched in parallel, cheap next to rendering.
      const sizes = await Promise.all(
        Array.from({ length: pdf.numPages }, async (_, i) => {
          const p = await (pdf as PdfDocument).getPage(i + 1)
          const v = p.getViewport({ scale: 1, rotation: p.rotate })
          return { width: v.width, height: v.height }
        }),
      )
      if (cancelled) return
      setLoad({ status: 'ready', pdf, sizes })
      onLoadRef.current?.({ pages: pdf.numPages })
    })().catch((error: unknown) => {
      if (!cancelled) setLoad({ status: 'error', error })
    })
    return () => {
      cancelled = true
      void task?.destroy()
    }
  }, [source, workerSrc, attempt])

  const ready = load.status === 'ready' ? load : undefined
  const sizes = ready?.sizes ?? []
  const numPages = sizes.length

  // Track the scroll area's size and position. It mounts once the document is ready.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `ready` re-runs this when it mounts
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const measure = () =>
      setViewport({ width: el.clientWidth, height: el.clientHeight, top: el.scrollTop })
    measure()
    const onScroll = () => setViewport((v) => ({ ...v, top: el.scrollTop }))
    el.addEventListener('scroll', onScroll, { passive: true })
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    observer?.observe(el)
    return () => {
      el.removeEventListener('scroll', onScroll)
      observer?.disconnect()
    }
  }, [ready])

  // Resolve fit modes against the first page.
  const zoom = useMemo(() => {
    if (typeof zoomMode === 'number') return zoomMode
    const first = sizes[0]
    if (!first || viewport.width === 0) return 1
    const box = pageBox(first, 1, rotation)
    const byWidth = (viewport.width - PAD * 2) / box.width
    if (zoomMode === 'fit-width') return Math.max(0.1, byWidth)
    return Math.max(0.1, Math.min(byWidth, (viewport.height - PAD * 2) / box.height))
  }, [zoomMode, sizes, viewport.width, viewport.height, rotation])

  // Page boxes and their offsets in the scroll area.
  const layout = useMemo(() => {
    let top = PAD
    return sizes.map((size) => {
      const box = pageBox(size, zoom, rotation)
      const entry = { top, ...box }
      top += box.height + GAP
      return entry
    })
  }, [sizes, zoom, rotation])
  const totalHeight = layout.length
    ? (layout.at(-1)?.top ?? 0) + (layout.at(-1)?.height ?? 0) + PAD
    : 0

  // Visible pages, plus one on each side.
  const [first, last] = useMemo(() => {
    if (layout.length === 0) return [0, -1]
    const bottom = viewport.top + (viewport.height || 800)
    let a = layout.findIndex((p) => p.top + p.height >= viewport.top)
    if (a === -1) a = layout.length - 1
    let b = a
    while (b + 1 < layout.length && (layout[b + 1]?.top ?? 0) < bottom) b++
    return [Math.max(0, a - 1), Math.min(layout.length - 1, b + 1)]
  }, [layout, viewport.top, viewport.height])

  // The current page is the one under the middle of the view.
  useEffect(() => {
    if (layout.length === 0) return
    const middle = viewport.top + viewport.height / 3
    let current = 1
    for (let i = 0; i < layout.length; i++) {
      if ((layout[i]?.top ?? 0) <= middle) current = i + 1
    }
    setPage((p) => (p === current ? p : current))
  }, [layout, viewport.top, viewport.height])
  useEffect(() => {
    setPageDraft(String(page))
    onPageChangeRef.current?.(page)
  }, [page])

  const goToPage = useCallback(
    (n: number) => {
      const target = Math.min(Math.max(1, n), numPages || 1)
      const el = scroller.current
      const entry = layout[target - 1]
      if (el && entry) el.scrollTop = entry.top - PAD
      setPage(target)
    },
    [layout, numPages],
  )

  // Open on `defaultPage` once laid out.
  const opened = useRef(false)
  useLayoutEffect(() => {
    if (!opened.current && layout.length > 0 && viewport.width > 0) {
      opened.current = true
      if (defaultPage > 1) goToPage(defaultPage)
    }
  }, [layout, viewport.width, defaultPage, goToPage])

  // Keep the current page in place when the zoom or rotation changes.
  const anchor = useRef<{ page: number; offset: number } | null>(null)
  const setZoomKeepingPage = (next: PdfZoom) => {
    const entry = layout[page - 1]
    if (entry) anchor.current = { page, offset: (viewport.top - entry.top) / entry.height }
    setZoomMode(next)
  }
  useLayoutEffect(() => {
    const a = anchor.current
    const el = scroller.current
    const entry = a ? layout[a.page - 1] : undefined
    if (!a || !el || !entry) return
    el.scrollTop = entry.top + a.offset * entry.height
    anchor.current = null
  }, [layout])

  const stepZoom = (direction: 1 | -1) => {
    const next =
      direction > 0
        ? (ZOOM_STEPS.find((z) => z > zoom + 0.01) ?? ZOOM_STEPS.at(-1))
        : ([...ZOOM_STEPS].reverse().find((z) => z < zoom - 0.01) ?? ZOOM_STEPS[0])
    setZoomKeepingPage(next as number)
  }

  // Search: page texts load on the first search.
  useEffect(() => {
    if (!ready || !query.trim() || texts) return
    let cancelled = false
    Promise.all(
      Array.from({ length: ready.pdf.numPages }, async (_, i) => {
        const p = await ready.pdf.getPage(i + 1)
        const content = await p.getTextContent()
        return content.items.map((item) => ('str' in item ? item.str : ''))
      }),
    ).then(
      (result) => !cancelled && setTexts(result),
      () => {},
    )
    return () => {
      cancelled = true
    }
  }, [ready, query, texts])

  const perPage = useMemo(
    () => (texts ? texts.map((items) => countMatches(items, query)) : []),
    [texts, query],
  )
  const totalMatches = perPage.reduce((a, b) => a + b, 0)
  const matchLocation = useMemo(() => {
    let rest = matchIndex
    for (let i = 0; i < perPage.length; i++) {
      const n = perPage[i] ?? 0
      if (rest < n) return { page: i + 1, index: rest }
      rest -= n
    }
    return null
  }, [perPage, matchIndex])

  const goToMatch = (next: number) => {
    if (totalMatches === 0) return
    setMatchIndex((next + totalMatches) % totalMatches)
  }

  // Bring the current match's page into the render window (also for the first match of a
  // new search); the page then scrolls the highlighted match itself into view.
  const matchPage = matchLocation?.page
  // biome-ignore lint/correctness/useExhaustiveDependencies: only when the match moves
  useEffect(() => {
    if (!matchPage) return
    const entry = layout[matchPage - 1]
    const el = scroller.current
    if (!el || !entry) return
    const inView =
      entry.top + entry.height >= el.scrollTop && entry.top <= el.scrollTop + el.clientHeight
    if (!inView) el.scrollTop = entry.top - PAD
  }, [matchPage, matchIndex, query])

  const print = async () => {
    const bytes = await readBytes(source)
    const { url, revoke } = sourceUrl(new Blob([bytes], { type: 'application/pdf' }))
    const frame = document.createElement('iframe')
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
    frame.src = url
    frame.onload = () => {
      frame.contentWindow?.focus()
      frame.contentWindow?.print()
      setTimeout(() => {
        frame.remove()
        revoke()
      }, 60_000)
    }
    document.body.append(frame)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const mod = event.metaKey || event.ctrlKey
    if (mod && event.key.toLowerCase() === 'f') {
      event.preventDefault()
      searchInput.current?.focus()
      searchInput.current?.select()
      return
    }
    if ((event.target as HTMLElement).closest('input,button,[role="combobox"],[role="listbox"]'))
      return
    const actions: Record<string, () => void> = {
      PageDown: () => goToPage(page + 1),
      PageUp: () => goToPage(page - 1),
      Home: () => goToPage(1),
      End: () => goToPage(numPages),
      '+': () => stepZoom(1),
      '=': () => stepZoom(1),
      '-': () => stepZoom(-1),
      '0': () => setZoomKeepingPage('fit-width'),
      r: () => setRotation((r) => (r + 90) % 360),
    }
    const action = actions[event.key]
    if (action && !(mod && event.key === '0')) {
      event.preventDefault()
      action()
    }
  }

  const zoomValue = typeof zoomMode === 'number' ? String(zoomMode) : zoomMode
  const showSidebar = sidebar && !narrow

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: shortcuts bubble up from the viewer's controls and pages
    <div
      ref={root}
      data-slot="pdf-viewer"
      // Tells assistive tech (and tests) the document is still loading.
      aria-busy={load.status === 'loading' || undefined}
      className={cn(s.root({ class: slots.root }), className)}
      style={fullscreen.active ? undefined : heightStyle(height)}
      onKeyDown={onKeyDown}
    >
      <div role="toolbar" aria-label="PDF tools" className={s.toolbar({ class: slots.toolbar })}>
        <ToolButton
          label={sidebar ? 'Hide thumbnails' : 'Show thumbnails'}
          icon={<PanelLeftIcon />}
          aria-pressed={sidebar}
          onClick={() => setSidebar((v) => !v)}
          className="max-sm:hidden"
        />
        <span className={s.group({ class: slots.group })}>
          <ToolButton
            label="Previous page"
            icon={<ChevronLeftIcon />}
            disabled={!ready || page <= 1}
            onClick={() => goToPage(page - 1)}
          />
          <form
            onSubmit={(event: FormEvent) => {
              event.preventDefault()
              const n = Number.parseInt(pageDraft, 10)
              if (Number.isFinite(n)) goToPage(n)
              else setPageDraft(String(page))
            }}
          >
            <Input
              size="sm"
              inputMode="numeric"
              aria-label="Page number"
              value={pageDraft}
              disabled={!ready}
              onChange={(event) => setPageDraft(event.target.value.replace(/\D/g, ''))}
              onBlur={() => setPageDraft(String(page))}
              className={s.pageInput({ class: slots.pageInput })}
            />
          </form>
          <span className={s.pageCount({ class: slots.pageCount })}>/ {numPages || '–'}</span>
          <ToolButton
            label="Next page"
            icon={<ChevronRightIcon />}
            disabled={!ready || page >= numPages}
            onClick={() => goToPage(page + 1)}
          />
        </span>
        <span className={s.divider({ class: slots.divider })} />
        <span className={s.group({ class: slots.group })}>
          <ToolButton
            label="Zoom out"
            className="max-sm:hidden"
            shortcut="−"
            icon={<ZoomOutIcon />}
            disabled={!ready}
            onClick={() => stepZoom(-1)}
          />
          <Select
            size="sm"
            aria-label="Zoom"
            value={zoomValue}
            disabled={!ready}
            onValueChange={(v) =>
              setZoomKeepingPage(v === 'fit-width' || v === 'fit-page' ? v : Number(v))
            }
            className={s.zoomSelect({ class: slots.zoomSelect })}
          >
            <SelectItem value="fit-width">Fit width</SelectItem>
            <SelectItem value="fit-page">Fit page</SelectItem>
            {ZOOM_STEPS.map((z) => (
              <SelectItem key={z} value={String(z)}>
                {Math.round(z * 100)}%
              </SelectItem>
            ))}
            {typeof zoomMode === 'number' && !ZOOM_STEPS.includes(zoomMode) && (
              <SelectItem value={String(zoomMode)}>{Math.round(zoomMode * 100)}%</SelectItem>
            )}
          </Select>
          <ToolButton
            label="Zoom in"
            className="max-sm:hidden"
            shortcut="+"
            icon={<ZoomInIcon />}
            disabled={!ready}
            onClick={() => stepZoom(1)}
          />
          <ToolButton
            label="Rotate"
            className="max-sm:hidden"
            shortcut="R"
            icon={<RotateIcon />}
            disabled={!ready}
            onClick={() => setRotation((r) => (r + 90) % 360)}
          />
        </span>
        <span className={s.spacer({ class: slots.spacer })} />
        <span className={s.searchGroup({ class: slots.searchGroup })}>
          <Input
            ref={searchInput}
            size="sm"
            type="search"
            aria-label="Search in document"
            placeholder="Search…"
            prefix={<SearchIcon />}
            value={query}
            disabled={!ready}
            onChange={(event) => {
              setQuery(event.target.value)
              setMatchIndex(0)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                goToMatch(matchIndex + (event.shiftKey ? -1 : 1))
              }
            }}
            className={s.search({ class: slots.search })}
          />
          {query.trim() && (
            <span className={s.counter({ class: slots.counter })} aria-live="polite">
              {!texts
                ? 'Searching…'
                : totalMatches === 0
                  ? 'No matches'
                  : `${matchIndex + 1} of ${totalMatches}`}
            </span>
          )}
          <ToolButton
            label="Previous match"
            icon={<ChevronUpIcon />}
            disabled={totalMatches === 0}
            onClick={() => goToMatch(matchIndex - 1)}
          />
          <ToolButton
            label="Next match"
            icon={<ChevronDownIcon />}
            disabled={totalMatches === 0}
            onClick={() => goToMatch(matchIndex + 1)}
          />
        </span>
        <span className={s.divider({ class: slots.divider })} />
        <ToolButton
          label="Download"
          icon={<DownloadIcon />}
          onClick={() => download(source, name)}
        />
        <ToolButton
          label="Print"
          icon={<PrinterIcon />}
          disabled={!ready}
          onClick={() => void print()}
          className="max-sm:hidden"
        />
        {fullscreen.supported && (
          <ToolButton
            label={fullscreen.active ? 'Exit fullscreen' : 'Fullscreen'}
            icon={fullscreen.active ? <MinimizeIcon /> : <MaximizeIcon />}
            onClick={fullscreen.toggle}
          />
        )}
      </div>

      <div className={s.body({ class: slots.body })}>
        {load.status === 'loading' &&
          (load.progress === null ? (
            <ViewerStatus status="loading" label={`Opening ${name}…`} />
          ) : (
            <div
              className="grid min-h-48 content-center justify-items-center gap-3 p-6 text-small text-muted-foreground"
              role="status"
            >
              Opening {name}… {Math.round(load.progress * 100)}%
              <Progress
                value={load.progress * 100}
                className="w-56"
                aria-label="Loading the document"
              />
            </div>
          ))}
        {load.status === 'error' && (
          <ViewerStatus
            status="error"
            error={load.error}
            onRetry={() => setAttempt((n) => n + 1)}
          />
        )}
        {load.status === 'password' && (
          <PasswordPrompt state={load} className={s.password({ class: slots.password })} />
        )}
        {ready && (
          <div className={s.layout({ class: slots.layout })}>
            {showSidebar && (
              <nav aria-label="Pages" className={s.sidebar({ class: slots.sidebar })}>
                {sizes.map((size, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Page ${i + 1}`}
                    aria-current={page === i + 1 ? 'page' : undefined}
                    data-current={page === i + 1 ? '' : undefined}
                    onClick={() => goToPage(i + 1)}
                    className={s.thumb({ class: slots.thumb })}
                  >
                    <PdfThumbnail
                      pdf={ready.pdf}
                      pageNumber={i + 1}
                      size={size}
                      rotation={rotation}
                    />
                    <span aria-hidden="true">{i + 1}</span>
                  </button>
                ))}
              </nav>
            )}
            <div
              ref={scroller}
              // biome-ignore lint/a11y/noNoninteractiveTabindex: the page area scrolls with the keyboard
              tabIndex={0}
              role="document"
              aria-label={name}
              className={s.pages({ class: slots.pages })}
            >
              <div
                style={{
                  height: totalHeight,
                  position: 'relative',
                  minWidth: (layout[0]?.width ?? 0) + PAD * 2,
                }}
              >
                {layout.map((entry, i) =>
                  i >= first && i <= last ? (
                    <div
                      key={i}
                      className="absolute inset-x-0 flex justify-center px-4"
                      style={{ top: entry.top }}
                    >
                      <PdfPageView
                        pdf={ready.pdf}
                        pageNumber={i + 1}
                        zoom={zoom}
                        rotation={rotation}
                        size={sizes[i] as PageSize}
                        render
                        query={query}
                        activeMatch={matchLocation?.page === i + 1 ? matchLocation.index : -1}
                      />
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PasswordPrompt({
  state,
  className,
}: {
  state: Extract<Load, { status: 'password' }>
  className?: string
}) {
  const [password, setPassword] = useState('')
  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault()
        state.submit(password)
      }}
    >
      <span className="flex items-center gap-2 font-medium text-foreground">
        <LockIcon aria-hidden="true" /> This PDF is password protected
      </span>
      <PasswordInput
        aria-label="Password"
        autoComplete="off"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        aria-invalid={state.retry || undefined}
        autoFocus
      />
      {state.retry && (
        <span className="text-danger-text">That password isn’t right. Try again.</span>
      )}
      <Button type="submit" disabled={!password}>
        Open
      </Button>
    </form>
  )
}
