import { defineTheme } from '@glyphui/tokens'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { glyph } from '../themes'
import { GlyphProvider } from './glyph-provider'

describe('contrast warning', () => {
  afterEach(() => vi.restoreAllMocks())

  it('warns once per theme when its colors fail contrast', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const unreadable = defineTheme({
      name: 'unreadable',
      extends: glyph,
      colors: {
        dark: { primary: 'oklch(72% 0.16 160)', 'primary-foreground': 'oklch(100% 0 0)' },
      },
    })
    const { rerender } = render(
      <GlyphProvider theme={unreadable} storageKey={null}>
        x
      </GlyphProvider>,
    )
    rerender(
      <GlyphProvider theme={unreadable} storageKey={null}>
        y
      </GlyphProvider>,
    )
    const calls = warn.mock.calls.filter(([m]) => String(m).includes('contrast'))
    expect(calls).toHaveLength(1)
    expect(String(calls[0]?.[0])).toMatch(
      /dark: primary-foreground on oklch\(72% 0\.16 160\) is 2\.\d+:1/,
    )
  })

  it('stays quiet for a theme that passes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <GlyphProvider theme={glyph} storageKey={null}>
        x
      </GlyphProvider>,
    )
    expect(warn.mock.calls.filter(([m]) => String(m).includes('contrast'))).toHaveLength(0)
  })
})
