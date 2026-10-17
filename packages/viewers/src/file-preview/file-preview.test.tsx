import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithGlyph } from '../test-utils'
import { detectFileKind } from './detect'
import { FilePreview } from './file-preview'
import { FilePreviewDialog } from './file-preview-dialog'

describe('detectFileKind', () => {
  it('uses the extension first, then the MIME type', () => {
    expect(detectFileKind({ name: 'Report.PDF' })).toBe('pdf')
    expect(detectFileKind({ name: 'data.tsv' })).toBe('csv')
    expect(detectFileKind({ name: 'book.xlsx' })).toBe('spreadsheet')
    expect(detectFileKind({ name: 'app.tsx' })).toBe('code')
    expect(detectFileKind({ name: 'https://x.dev/notes.md?v=2#top' })).toBe('markdown')
    expect(detectFileKind({ name: 'photo', type: 'image/heic' })).toBe('image')
    expect(detectFileKind({ name: 'blob', type: 'video/mp4' })).toBe('video')
    expect(detectFileKind({ name: 'x.bin', type: 'application/json; charset=utf-8' })).toBe('json')
    expect(detectFileKind({ type: 'text/x-log' })).toBe('text')
    expect(detectFileKind({ name: 'archive.zip' })).toBe('unknown')
  })
})

describe('FilePreview', () => {
  it('shows the name, kind and size, and previews text without loaders', async () => {
    const file = new File(['hello there'], 'notes.txt', { type: 'text/plain' })
    renderWithGlyph(<FilePreview file={file} />)
    expect(screen.getByText('notes.txt')).toBeInTheDocument()
    expect(screen.getByText(/Text file · 11 B/)).toBeInTheDocument()
    expect(await screen.findByText('hello there')).toBeInTheDocument()
  })

  it('renders JSON with the built-in viewer', async () => {
    renderWithGlyph(<FilePreview file={new Blob(['{"ok": true}'])} name="status.json" />)
    expect(await screen.findByRole('tree', { name: 'status.json' })).toBeInTheDocument()
  })

  it('uses loaders for viewers with extra dependencies', async () => {
    const PdfViewer = vi.fn(({ fileName }: { fileName?: string }) => (
      <p>PDF viewer for {fileName}</p>
    ))
    renderWithGlyph(
      <FilePreview
        file="https://example.com/report.pdf"
        loaders={{ pdf: async () => ({ PdfViewer }) }}
      />,
    )
    expect(await screen.findByText('PDF viewer for report.pdf')).toBeInTheDocument()
  })

  it('offers a download when it has no viewer', async () => {
    renderWithGlyph(<FilePreview file="https://example.com/report.pdf" />)
    expect(screen.getByText('No preview for this file')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument()
  })

  it('opens in a dialog', async () => {
    const file = new File(['line one'], 'a.txt', { type: 'text/plain' })
    renderWithGlyph(
      <FilePreviewDialog file={file} trigger={<button type="button">Preview a.txt</button>} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Preview a.txt' }))
    expect(await screen.findByRole('dialog', { name: 'a.txt' })).toBeInTheDocument()
    expect(await screen.findByText('line one')).toBeInTheDocument()
  })
})
