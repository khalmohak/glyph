import { describe, expect, it } from 'vitest'
import { auditContrast } from './audit'
import { colorDistance, composite, contrastRatio, parseColor } from './contrast'
import { defineTheme } from './define-theme'
import { glyph, presets } from './presets'

describe('contrastRatio', () => {
  it('matches WCAG reference values', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 1)
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
    expect(contrastRatio('rgb(255 255 255)', 'oklch(100% 0 0)')).toBeCloseTo(1, 3)
  })

  it('parses color-mix in oklab', () => {
    const mixed = parseColor('color-mix(in oklab, oklch(100% 0 0) 50%, oklch(0% 0 0))')
    expect(mixed[0]).toBeCloseTo(0.5, 5)
    expect(() => parseColor('hsl(0 0% 0%)')).toThrow(/Unsupported/)
  })

  it('measures perceptual distance', () => {
    expect(colorDistance('oklch(60% 0.2 30)', 'oklch(60% 0.2 30)')).toBe(0)
    expect(colorDistance('oklch(60% 0.2 30)', 'oklch(60% 0.2 210)')).toBeGreaterThan(0.3)
  })
})

describe('auditContrast', () => {
  it.each(Object.entries(presets))('%s meets WCAG AA in both modes', (_name, theme) => {
    expect(auditContrast(theme)).toEqual([])
  })

  it('reports pairs below the minimum', () => {
    const low = defineTheme({
      name: 'low',
      extends: glyph,
      colors: { light: { 'muted-foreground': 'oklch(80% 0 0)' } },
    })
    expect(auditContrast(low)).toContainEqual(
      expect.objectContaining({ mode: 'light', foreground: 'muted-foreground', kind: 'text' }),
    )
  })

  it('reports chart colors that are too similar to tell apart', () => {
    const same = defineTheme({
      name: 'same',
      extends: glyph,
      colors: { dark: { 'chart-1': 'oklch(64% 0.19 255)', 'chart-2': 'oklch(64% 0.19 258)' } },
    })
    expect(auditContrast(same)).toContainEqual(
      expect.objectContaining({
        mode: 'dark',
        kind: 'chart-distance',
        foreground: 'chart-1',
        background: 'chart-2',
      }),
    )
  })
})

describe('status text colors', () => {
  it('derives readable text colors for a theme that changes its tones', () => {
    const theme = defineTheme({
      name: 'citrus',
      extends: glyph,
      colors: { light: { primary: 'oklch(85% 0.17 95)', success: 'oklch(88% 0.2 140)' } },
    })
    expect(theme.colors.light['primary-text']).not.toBe(glyph.colors.light['primary-text'])
    expect(
      contrastRatio(theme.colors.light['primary-text'], theme.colors.light.background),
    ).toBeGreaterThanOrEqual(4.5)
    expect(auditContrast(theme).filter((issue) => issue.foreground.endsWith('-text'))).toEqual([])
  })

  it('keeps a text color the theme sets explicitly, including through extends', () => {
    const base = defineTheme({
      name: 'base',
      extends: glyph,
      colors: { light: { 'primary-text': 'oklch(30% 0.1 255)' } },
    })
    const child = defineTheme({
      name: 'child',
      extends: base,
      colors: { light: { primary: 'red' } },
    })
    expect(base.colors.light['primary-text']).toBe('oklch(30% 0.1 255)')
    expect(child.colors.light['primary-text']).toBe('oklch(30% 0.1 255)')
  })

  it('uses the tone itself when it is already readable', () => {
    const theme = defineTheme({
      name: 'ink',
      extends: glyph,
      colors: { light: { primary: 'oklch(35% 0.12 255)' } },
    })
    expect(theme.colors.light['primary-text']).toBe('oklch(35% 0.12 255)')
  })

  it('leaves colors it cannot parse alone', () => {
    const theme = defineTheme({
      name: 'named',
      extends: glyph,
      colors: { light: { primary: 'red' } },
    })
    expect(theme.colors.light['primary-text']).toBe('red')
  })

  it('falls back to the foreground when no mix of the tone is readable', () => {
    // A foreground that is itself unreadable on the background: no mix can pass.
    const theme = defineTheme({
      name: 'fog',
      extends: glyph,
      colors: { light: { foreground: 'oklch(90% 0 0)', primary: 'oklch(92% 0.05 255)' } },
    })
    expect(theme.colors.light['primary-text']).toBe('oklch(90% 0 0)')
  })
})

describe('composite', () => {
  it('blends in sRGB like the browser', () => {
    const channels = (rgb: string) => rgb.slice(4, -1).split(' ').map(Number)
    const [r, g, b] = channels(composite('#ff0000', 0.5, '#ffffff'))
    expect(r).toBe(255)
    expect(g).toBeCloseTo(128, -0.5)
    expect(b).toBeCloseTo(128, -0.5)
    expect(channels(composite('#000000', 0, '#123456'))).toEqual([18, 52, 86])
  })
})
