import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatBytes, readBytes, readText, sourceName, sourceUrl } from './source'
import { hasViewersStyles, useViewersStylesCheck } from './styles-check'
import { useResource } from './use-resource'

afterEach(() => vi.unstubAllGlobals())

describe('sources', () => {
  it('names files and URLs', () => {
    expect(sourceName(new File([''], 'a.pdf'))).toBe('a.pdf')
    expect(sourceName('https://x.dev/files/My%20Report.pdf?dl=1')).toBe('My Report.pdf')
    expect(sourceName(new URL('https://x.dev/'))).toBeUndefined()
    expect(sourceName(new Uint8Array())).toBeUndefined()
  })

  it('reads bytes and text from every kind of source', async () => {
    expect(new Uint8Array(await readBytes(new Uint8Array([1, 2]))).length).toBe(2)
    expect(await readText(new Blob(['﻿hi']))).toBe('hi')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('remote')),
    )
    expect(await readText('https://x.dev/a.txt')).toBe('remote')
    const buffer = new ArrayBuffer(3)
    expect(await readBytes(buffer)).toBe(buffer)
  })

  it('makes object URLs for bytes and passes URLs through', () => {
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    expect(sourceUrl('https://x.dev/a.png').url).toBe('https://x.dev/a.png')
    const made = sourceUrl(new Uint8Array([1]))
    expect(made.url).toBe('blob:x')
    made.revoke()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x')
  })

  it('formats sizes', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
    expect(formatBytes(15 * 1024 * 1024)).toBe('15 MB')
    expect(formatBytes(-1)).toBe('')
  })

  it('decodes UTF-16 (Excel "Unicode text") and Windows-1252 (Excel CSV) files', async () => {
    const text = 'name,city\nRené,Zürich'
    // UTF-16LE with BOM
    const le = new Uint8Array(2 + text.length * 2)
    le.set([0xff, 0xfe])
    for (let i = 0; i < text.length; i++) le[2 + i * 2] = text.charCodeAt(i)
    expect(await readText(le)).toBe(text)
    // UTF-16BE with BOM
    const be = new Uint8Array(2 + text.length * 2)
    be.set([0xfe, 0xff])
    for (let i = 0; i < text.length; i++) be[3 + i * 2] = text.charCodeAt(i)
    expect(await readText(be)).toBe(text)
    // Windows-1252: é = 0xE9, ü = 0xFC, not valid UTF-8
    const latin = Uint8Array.from(text, (c) => c.charCodeAt(0))
    expect(await readText(latin)).toBe(text)
    // UTF-8 still wins when valid, BOM dropped
    expect(await readText(new TextEncoder().encode(`﻿${text}`))).toBe(text)
  })

  it('names URLs with broken percent-encoding without throwing', () => {
    expect(sourceName('https://x.dev/files/report%.pdf')).toBe('report%.pdf')
    expect(sourceName('https://x.dev/files/q3%20report.pdf')).toBe('q3 report.pdf')
  })
})

describe('useResource', () => {
  it('loads, and reloads on demand', async () => {
    let n = 0
    const { result } = renderHook(() => useResource(async () => ++n, []))
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.data).toBe(1)
    result.current.reload()
    await waitFor(() => expect(result.current.data).toBe(2))
  })

  it('reports errors', async () => {
    const { result } = renderHook(() =>
      useResource(async () => Promise.reject(new Error('boom')), []),
    )
    await waitFor(() => expect(result.current.status).toBe('error'))
  })
})

describe('styles check', () => {
  it('detects the stylesheet marker', () => {
    expect(hasViewersStyles()).toBe(false)
    document.documentElement.style.setProperty('--glyph-viewers-css', '1')
    expect(hasViewersStyles()).toBe(true)
    document.documentElement.style.removeProperty('--glyph-viewers-css')
  })

  it('stays quiet in tests', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderHook(() => useViewersStylesCheck())
    expect(warn).not.toHaveBeenCalled()
  })
})
