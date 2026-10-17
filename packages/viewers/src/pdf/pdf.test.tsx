import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithGlyph } from '../test-utils'
import { PdfViewer } from './pdf-viewer'
import { cdnWorkerUrl, countMatches, markMatches, setPdfWorker } from './pdfjs'

const pages = [
  ['Ledgerline Q3 report', 'Revenue grew 18%'],
  ['Highlights', 'Recurring revenue reached $34,900'],
  ['Outlook', 'Thank you'],
]

let passwordNeeded = false
const options = { workerSrc: '', workerPort: null as unknown }
// Loading tasks created and destroyed, to catch documents that outlive the viewer.
const tasks = { created: 0, destroyed: 0 }

function fakePage(n: number) {
  return {
    rotate: 0,
    getViewport: ({ scale = 1, rotation = 0 }: { scale?: number; rotation?: number }) => ({
      width: (rotation % 180 ? 792 : 612) * scale,
      height: (rotation % 180 ? 612 : 792) * scale,
      scale,
      rotation,
      rawDims: { pageWidth: 612, pageHeight: 792 },
    }),
    render: () => ({ promise: Promise.resolve(), cancel: () => {} }),
    streamTextContent: () => ({}),
    getTextContent: async () => ({ items: (pages[n - 1] ?? []).map((str) => ({ str })) }),
  }
}

vi.mock('pdfjs-dist', () => ({
  version: '6.3.289',
  GlobalWorkerOptions: options,
  PasswordResponses: { NEED_PASSWORD: 1, INCORRECT_PASSWORD: 2 },
  TextLayer: class {
    constructor(private params: { container: HTMLElement }) {}
    async render() {
      const span = document.createElement('span')
      span.textContent = 'Revenue grew'
      this.params.container.append(span)
    }
    cancel() {}
  },
  getDocument: () => {
    tasks.created++
    const task = {
      onProgress: undefined as undefined | ((p: { loaded: number; total: number }) => void),
      onPassword: undefined as undefined | ((update: (pw: string) => void, reason: number) => void),
      destroy: async () => {
        tasks.destroyed++
      },
      promise: new Promise((resolve) => {
        const open = () =>
          resolve({ numPages: pages.length, getPage: async (n: number) => fakePage(n) })
        queueMicrotask(() => {
          task.onProgress?.({ loaded: 50, total: 100 })
          if (passwordNeeded) task.onPassword?.((pw) => pw === 'secret' && open(), 1)
          else open()
        })
      }),
    }
    return task
  },
}))

beforeEach(() => {
  passwordNeeded = false
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({})) as never
})

describe('pdf.js helpers', () => {
  it('points the worker at a CDN by default and at your file when set', async () => {
    expect(cdnWorkerUrl('6.3.289')).toBe(
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/pdf.worker.min.mjs',
    )
    renderWithGlyph(<PdfViewer source={new Uint8Array([1])} />)
    await screen.findByText('/ 3')
    expect(options.workerSrc).toContain('cdn.jsdelivr.net')
    setPdfWorker('/assets/pdf.worker.js')
    await waitFor(() => expect(options.workerSrc).toBe('/assets/pdf.worker.js'))
  })

  it('counts and marks matches per text span', () => {
    expect(countMatches(['Revenue grew', 'more revenue'], 'REVENUE')).toBe(2)
    expect(countMatches(['x'], ' ')).toBe(0)
    const container = document.createElement('div')
    container.innerHTML = '<span>Revenue up, revenue down</span><span>other</span>'
    const marks = markMatches(container, 'revenue')
    expect(marks).toHaveLength(2)
    expect(markMatches(container, '')).toEqual([])
    expect(container.querySelectorAll('mark')).toHaveLength(0)
  })
})

describe('PdfViewer', () => {
  it('destroys every loading task, even when it unmounts mid-load', async () => {
    tasks.created = 0
    tasks.destroyed = 0
    // Blob bytes are read asynchronously, so cleanup runs before the task exists.
    const { unmount } = renderWithGlyph(<PdfViewer source={new Blob([new Uint8Array([1])])} />)
    unmount()
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(tasks.created - tasks.destroyed).toBe(0)

    // Switching sources tears down the previous document too.
    const view = renderWithGlyph(<PdfViewer source={new Uint8Array([1])} />)
    await screen.findByText('/ 3')
    view.rerender(<PdfViewer source={new Uint8Array([2])} />)
    await screen.findByText('/ 3')
    view.unmount()
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(tasks.created - tasks.destroyed).toBe(0)
  })

  it('opens a document and moves between pages', async () => {
    const onLoad = vi.fn()
    renderWithGlyph(<PdfViewer source={new Blob([new Uint8Array([1])])} onLoad={onLoad} />)
    expect(await screen.findByText('/ 3')).toBeInTheDocument()
    expect(onLoad).toHaveBeenCalledWith({ pages: 3 })
    const toolbar = screen.getByRole('toolbar', { name: 'PDF tools' })
    expect(within(toolbar).getByRole('textbox', { name: 'Page number' })).toHaveValue('1')
    await userEvent.click(within(toolbar).getByRole('button', { name: 'Next page' }))
    expect(within(toolbar).getByRole('textbox', { name: 'Page number' })).toHaveValue('2')
    expect(screen.getByRole('navigation', { name: 'Pages' })).toBeInTheDocument()
    expect(screen.getAllByRole('group', { name: /Page \d/ }).length).toBeGreaterThan(0)
  })

  it('searches every page and counts matches', async () => {
    renderWithGlyph(<PdfViewer source={new Uint8Array([1])} />)
    await screen.findByText('/ 3')
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search in document' }), 'revenue')
    expect(await screen.findByText('1 of 2')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Next match' }))
    expect(screen.getByText('2 of 2')).toBeInTheDocument()
  })

  it('zooms, rotates and hides thumbnails', async () => {
    renderWithGlyph(<PdfViewer source={new Uint8Array([1])} defaultZoom={1} />)
    await screen.findByText('/ 3')
    await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(screen.getByRole('combobox', { name: 'Zoom' })).toHaveTextContent('125%')
    await userEvent.click(screen.getByRole('button', { name: 'Hide thumbnails' }))
    expect(screen.queryByRole('navigation', { name: 'Pages' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Rotate' }))
    const page = screen.getAllByRole('group', { name: /Page \d/ })[0] as HTMLElement
    // A rotated letter page is wider than tall.
    expect(Number.parseFloat(page.style.width)).toBeGreaterThan(
      Number.parseFloat(page.style.height),
    )
  })

  it('asks for a password', async () => {
    passwordNeeded = true
    renderWithGlyph(<PdfViewer source={new Uint8Array([1])} />)
    expect(await screen.findByText('This PDF is password protected')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Password'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(await screen.findByText('/ 3')).toBeInTheDocument()
  })

  it('handles keyboard shortcuts', async () => {
    renderWithGlyph(<PdfViewer source={new Uint8Array([1])} defaultZoom={1} />)
    await screen.findByText('/ 3')
    const pagesArea = screen.getByRole('document')
    act(() => {
      fireEvent.keyDown(pagesArea, { key: 'End' })
    })
    expect(screen.getByRole('textbox', { name: 'Page number' })).toHaveValue('3')
    fireEvent.keyDown(pagesArea, { key: 'f', metaKey: true })
    expect(screen.getByRole('searchbox', { name: 'Search in document' })).toHaveFocus()
  })
})
