import { defineTheme } from '@glyphui/tokens'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { GlyphProvider } from '../provider/glyph-provider'
import { glyph, playful } from '../themes'
import { useMotionSettings } from './use-motion-settings'

function wrap(props: Partial<Parameters<typeof GlyphProvider>[0]>) {
  return ({ children }: { children: ReactNode }) => (
    <GlyphProvider storageKey={null} {...props}>
      {children}
    </GlyphProvider>
  )
}

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia
}

describe('useMotionSettings', () => {
  const original = window.matchMedia
  afterEach(() => {
    window.matchMedia = original
  })

  it('uses the theme level and spring', () => {
    mockReducedMotion(false)
    const { result } = renderHook(useMotionSettings, { wrapper: wrap({ theme: playful }) })
    expect(result.current.level).toBe('expressive')
    expect(result.current.animate).toBe(true)
    expect(result.current.spring).toMatchObject({ type: 'spring', damping: 18 })
  })

  it('lets the provider override the theme', () => {
    mockReducedMotion(false)
    const { result } = renderHook(useMotionSettings, {
      wrapper: wrap({ theme: glyph, motion: 'none' }),
    })
    expect(result.current.animate).toBe(false)
  })

  it('turns motion off when the visitor prefers reduced motion', () => {
    mockReducedMotion(true)
    const { result } = renderHook(useMotionSettings, {
      wrapper: wrap({ theme: playful, motion: 'expressive' }),
    })
    expect(result.current.level).toBe('none')
  })

  it('converts theme durations to seconds and defaults the level to subtle', () => {
    mockReducedMotion(false)
    const theme = defineTheme({ name: 'x', extends: glyph, motion: { level: undefined } })
    const { result } = renderHook(useMotionSettings, { wrapper: wrap({ theme }) })
    expect(result.current.duration.fast).toBeCloseTo(0.12)
    expect(['subtle', 'none', 'expressive']).toContain(result.current.level)
  })
})
