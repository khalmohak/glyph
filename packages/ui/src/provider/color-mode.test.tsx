import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { ColorModeProvider, useColorMode } from './color-mode'

const wrapper = ({ children }: { children: ReactNode }) => (
  <ColorModeProvider defaultMode="light">{children}</ColorModeProvider>
)

describe('ColorModeProvider', () => {
  afterEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.mode
  })

  it('ignores an invalid stored mode', () => {
    localStorage.setItem('glyph-mode', 'purple')
    const { result } = renderHook(useColorMode, { wrapper })
    expect(result.current.mode).toBe('light')
  })

  it('follows a mode change made in another tab', () => {
    const { result } = renderHook(useColorMode, { wrapper })
    expect(result.current.resolvedMode).toBe('light')
    act(() => {
      localStorage.setItem('glyph-mode', 'dark')
      window.dispatchEvent(new StorageEvent('storage', { key: 'glyph-mode', newValue: 'dark' }))
    })
    expect(result.current.mode).toBe('dark')
    expect(document.documentElement.dataset.mode).toBe('dark')
  })

  it('ignores storage events for other keys and invalid values', () => {
    const { result } = renderHook(useColorMode, { wrapper })
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'other', newValue: 'dark' }))
      window.dispatchEvent(new StorageEvent('storage', { key: 'glyph-mode', newValue: 'neon' }))
    })
    expect(result.current.mode).toBe('light')
  })
})
