import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { type FileItem, FileUpload, formatBytes, matchesAccept } from './file-upload'

const file = (name: string, size: number, type: string) => {
  const f = new File(['x'], name, { type })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

describe('FileUpload', () => {
  it('adds chosen files and removes them', async () => {
    const onFilesChange = vi.fn()
    const { container } = render(<FileUpload onFilesChange={onFilesChange} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, [file('report.pdf', 2048, 'application/pdf')])
    expect(screen.getByText('report.pdf')).toBeInTheDocument()
    expect(screen.getByText('2.0 KB')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remove report.pdf' }))
    expect(onFilesChange).toHaveBeenLastCalledWith([])
  })

  it('rejects wrong types and oversized files on drop, with messages', () => {
    const onReject = vi.fn()
    render(<FileUpload accept="image/*" maxSize={1024} onReject={onReject} />)
    const dropzone = screen.getByRole('button', { name: /Drop files here/ })
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file('notes.txt', 10, 'text/plain'), file('big.png', 5000, 'image/png')],
      },
    })
    expect(onReject.mock.calls[0]![0].map((r: { reason: string }) => r.reason)).toEqual([
      'wrong-type',
      'too-large',
    ])
    expect(screen.getByRole('alert')).toHaveTextContent("notes.txt isn't an allowed file type.")
    expect(screen.getByRole('alert')).toHaveTextContent('big.png is too large')
  })

  it('shows progress and errors from controlled items', () => {
    const items: FileItem[] = [
      { id: '1', file: file('a.png', 100, 'image/png'), progress: 40 },
      { id: '2', file: file('b.png', 100, 'image/png'), error: 'Upload failed' },
    ]
    render(<FileUpload files={items} />)
    expect(screen.getByRole('progressbar', { name: 'Uploading a.png' })).toHaveAttribute(
      'aria-valuenow',
      '40',
    )
    expect(screen.getByText('Upload failed')).toBeInTheDocument()
  })

  it('enforces maxFiles', async () => {
    const { container } = render(<FileUpload maxFiles={1} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, [file('a.png', 1, 'image/png'), file('b.png', 1, 'image/png')])
    expect(screen.getByRole('alert')).toHaveTextContent("b.png wasn't added")
    expect(screen.getByRole('button', { name: /File limit reached/ })).toBeDisabled()
  })
})

describe('helpers', () => {
  it('formats bytes and matches accept rules', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(15 * 1024 * 1024)).toBe('15 MB')
    expect(matchesAccept(new File([''], 'a.PDF', { type: '' }), '.pdf')).toBe(true)
    expect(matchesAccept(new File([''], 'a.png', { type: 'image/png' }), 'image/*')).toBe(true)
    expect(
      matchesAccept(new File([''], 'a.zip', { type: 'application/zip' }), 'image/*,.pdf'),
    ).toBe(false)
  })

  it('lists two rejected files with the same name without key clashes', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(<FileUpload maxSize={10} />)
    const input = container.querySelector('input[type="file"]')!
    fireEvent.change(input, {
      target: {
        files: [file('scan.pdf', 50, 'application/pdf'), file('scan.pdf', 60, 'application/pdf')],
      },
    })
    expect(screen.getAllByText(/scan\.pdf is too large/)).toHaveLength(2)
    expect(errors).not.toHaveBeenCalled()
    errors.mockRestore()
  })
})
