import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('useFontsVersion', () => {
  it('changes when web fonts finish loading, so text gets measured again', async () => {
    vi.resetModules()
    const fonts = new EventTarget() as EventTarget & { ready: Promise<unknown> }
    let resolveReady: (value: unknown) => void = () => {}
    fonts.ready = new Promise((resolve) => {
      resolveReady = resolve
    })
    Object.defineProperty(document, 'fonts', { value: fonts, configurable: true })
    const { useFontsVersion } = await import('./use-fonts-version')

    const { result } = renderHook(() => useFontsVersion())
    const first = result.current
    await act(async () => {
      resolveReady(fonts)
      await fonts.ready
    })
    expect(result.current).toBeGreaterThan(first)
    const afterReady = result.current
    act(() => {
      fonts.dispatchEvent(new Event('loadingdone'))
    })
    expect(result.current).toBeGreaterThan(afterReady)
  })
})
