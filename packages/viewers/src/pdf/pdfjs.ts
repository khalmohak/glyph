import type * as Pdfjs from 'pdfjs-dist'

export type PdfjsModule = typeof Pdfjs
export type PdfDocument = Pdfjs.PDFDocumentProxy
export type PdfPage = Pdfjs.PDFPageProxy

/** Where pdf.js's worker comes from: a URL string, a `URL`, or a ready `Worker`. */
export type PdfWorkerSource = string | URL | Worker

let workerSource: PdfWorkerSource | undefined
let pdfjs: Promise<PdfjsModule> | undefined

/**
 * Sets pdf.js's worker for every PdfViewer. Call it once at startup to self-host the worker
 * instead of loading it from jsDelivr (the default):
 *
 * ```ts
 * // Vite
 * import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
 * setPdfWorker(workerSrc)
 *
 * // webpack 5 / Next.js
 * setPdfWorker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url))
 * ```
 */
export function setPdfWorker(source: PdfWorkerSource): void {
  workerSource = source
  // Applies to documents opened from now on, also when pdf.js is already loaded.
  if (pdfjs) void pdfjs.then((lib) => configure(lib, source))
}

/** The jsDelivr URL of the worker that matches the installed pdf.js version. */
export function cdnWorkerUrl(version: string): string {
  return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
}

function configure(lib: PdfjsModule, source: PdfWorkerSource | undefined): void {
  if (typeof Worker !== 'undefined' && source instanceof Worker) {
    lib.GlobalWorkerOptions.workerPort = source
    return
  }
  // pdf.js wraps a cross-origin worker URL itself, so the CDN default works without CORS setup.
  lib.GlobalWorkerOptions.workerSrc = source ? String(source) : cdnWorkerUrl(lib.version)
}

/** Loads pdf.js on first use and points it at a worker. */
export function loadPdfjs(override?: PdfWorkerSource): Promise<PdfjsModule> {
  pdfjs ??= import('pdfjs-dist').then((lib) => {
    configure(lib, workerSource)
    return lib
  })
  if (override) {
    return pdfjs.then((lib) => {
      configure(lib, override)
      return lib
    })
  }
  return pdfjs
}

/** pdf.js treats 72 points as an inch; CSS treats 96px as an inch. */
export const CSS_UNITS = 96 / 72

export interface PageSize {
  width: number
  height: number
}

/** Counts case-insensitive matches of `query` in each text item, so highlights line up. */
export function countMatches(items: readonly string[], query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 0
  let count = 0
  for (const item of items) {
    const text = item.toLowerCase()
    let at = text.indexOf(q)
    while (at !== -1) {
      count++
      at = text.indexOf(q, at + q.length)
    }
  }
  return count
}

/**
 * Wraps matches of `query` inside a rendered text layer's spans in `<mark>` elements and
 * returns them in reading order. Returns `[]` and leaves spans untouched for an empty query.
 */
export function markMatches(container: HTMLElement, query: string): HTMLElement[] {
  // Undo earlier marks.
  for (const mark of container.querySelectorAll('mark')) {
    mark.replaceWith(document.createTextNode(mark.textContent ?? ''))
  }
  container.normalize()
  const q = query.trim().toLowerCase()
  if (!q) return []
  const marks: HTMLElement[] = []
  for (const span of container.querySelectorAll<HTMLElement>('span:not(.markedContent)')) {
    const node = span.firstChild
    if (!node || node.nodeType !== Node.TEXT_NODE || span.childNodes.length !== 1) continue
    const text = node.textContent ?? ''
    const lower = text.toLowerCase()
    let at = lower.indexOf(q)
    if (at === -1) continue
    const fragment = document.createDocumentFragment()
    let from = 0
    while (at !== -1) {
      if (at > from) fragment.append(text.slice(from, at))
      const mark = document.createElement('mark')
      mark.textContent = text.slice(at, at + q.length)
      fragment.append(mark)
      marks.push(mark)
      from = at + q.length
      at = lower.indexOf(q, from)
    }
    if (from < text.length) fragment.append(text.slice(from))
    span.replaceChildren(fragment)
  }
  return marks
}
