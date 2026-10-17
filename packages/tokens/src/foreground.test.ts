import { describe, expect, it } from 'vitest'
import { auditContrast } from './audit'
import { contrastRatio } from './contrast'
import { defineTheme } from './define-theme'
import { glyph } from './presets'

describe('solid tone foregrounds', () => {
  it('derives a readable foreground when a theme brightens a tone without setting one', () => {
    // The Ledgerline case: a bright emerald primary kept glyph's white text (2.25:1).
    const theme = defineTheme({
      name: 'emerald',
      extends: glyph,
      colors: { dark: { primary: 'oklch(72% 0.16 160)' } },
    })
    const { primary, 'primary-foreground': fg } = theme.colors.dark
    expect(contrastRatio(fg, primary)).toBeGreaterThanOrEqual(4.5)
    expect(
      auditContrast(theme).filter((issue) => issue.foreground === 'primary-foreground'),
    ).toEqual([])
  })

  it('keeps an explicit foreground, even a failing one', () => {
    const theme = defineTheme({
      name: 'explicit',
      extends: glyph,
      colors: {
        dark: { primary: 'oklch(72% 0.16 160)', 'primary-foreground': 'oklch(100% 0 0)' },
      },
    })
    expect(theme.colors.dark['primary-foreground']).toBe('oklch(100% 0 0)')
  })

  it('keeps the inherited foreground when it still passes', () => {
    const theme = defineTheme({
      name: 'deep',
      extends: glyph,
      colors: { light: { primary: 'oklch(40% 0.18 260)' } },
    })
    expect(theme.colors.light['primary-foreground']).toBe(glyph.colors.light['primary-foreground'])
  })

  it('leaves tones the theme does not change alone', () => {
    const theme = defineTheme({ name: 'same', extends: glyph, radius: { md: '4px' } })
    for (const mode of ['light', 'dark'] as const)
      for (const tone of ['primary', 'success', 'warning', 'danger', 'info', 'secondary'] as const)
        expect(theme.colors[mode][`${tone}-foreground`]).toBe(
          glyph.colors[mode][`${tone}-foreground`],
        )
  })

  it('derives for every solid tone, in both modes', () => {
    const theme = defineTheme({
      name: 'pastel',
      extends: glyph,
      colors: {
        light: { warning: 'oklch(90% 0.15 95)', info: 'oklch(85% 0.1 230)' },
        dark: { danger: 'oklch(80% 0.12 25)' },
      },
    })
    for (const [mode, tone] of [
      ['light', 'warning'],
      ['light', 'info'],
      ['dark', 'danger'],
    ] as const) {
      const scale = theme.colors[mode]
      expect(contrastRatio(scale[`${tone}-foreground`], scale[tone])).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe('status text on raised surfaces', () => {
  it('stays readable on menus and popovers (the raised background) in every preset', async () => {
    const { presets } = await import('./presets')
    const { statusTextTokens } = await import('./schema')
    const failures: string[] = []
    for (const [name, theme] of Object.entries(presets))
      for (const mode of ['light', 'dark'] as const)
        for (const token of statusTextTokens) {
          const ratio = contrastRatio(theme.colors[mode][token], theme.colors[mode].raised)
          if (ratio < 4.5) failures.push(`${name} ${mode} ${token} ${ratio.toFixed(2)}`)
        }
    expect(failures).toEqual([])
  })
})
