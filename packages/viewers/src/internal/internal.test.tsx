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
