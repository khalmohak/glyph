import { auditContrast, contrastRatio, defineTheme, presets } from '@glyphui/ui'
import { describe, expect, it } from 'vitest'
import {
  buildTheme,
  decodeState,
  encodeState,
  fixColor,
  isPristine,
  type StudioState,
  themeFile,
  toOklch,
} from './theme-studio'

const edited: StudioState = {
  base: 'glyph',
  name: 'acme',
  colors: {
    light: { primary: 'oklch(58% 0.2 25)', 'muted-foreground': 'oklch(50% 0.02 260)' },
    dark: { primary: 'oklch(70% 0.18 25)' },
  },
  font: { display: '"Newsreader Variable", "Newsreader", ui-serif, Georgia, serif' },
  tracking: '-0.03em',
  radius: { md: 10, lg: 16 },
  borderWidth: 2,
  shadow: 'hard',
  density: 'comfortable',
  motion: { level: 'expressive', damping: 20 },
}

/** Evaluates the exported file's `defineTheme({...})` argument the way a bundler would. */
function evaluateThemeFile(source: string) {
  const start = source.indexOf('defineTheme(') + 'defineTheme('.length
  const end = source.lastIndexOf(')')
  const objectLiteral = source.slice(start, end)
  return new Function('presets', `return (${objectLiteral})`)(presets)
}

describe('theme studio', () => {
  it('exports a theme file that defineTheme accepts and that matches the preview', () => {
    const file = themeFile(edited)
    expect(file).toContain("import { defineTheme, presets } from '@glyphui/ui'")
    expect(file).toContain('extends: presets.glyph,')
    expect(file).toContain("primary: 'oklch(58% 0.2 25)'")
    expect(file).toContain("'muted-foreground': 'oklch(50% 0.02 260)'")
    const input = evaluateThemeFile(file)
    const fromFile = defineTheme(input)
    const preview = buildTheme(edited)
    expect(fromFile.colors).toEqual(preview.colors)
    expect(fromFile.radius.md).toBe('10px')
    expect(fromFile.border.width).toBe('2px')
    expect(fromFile.control.md).toBe('40px')
    expect(fromFile.motion.level).toBe('expressive')
    expect(fromFile.motion.spring?.damping).toBe(20)
    expect(fromFile.text.display.tracking).toBe('-0.03em')
  })

  it('exports only what changed', () => {
    const file = themeFile({ base: 'editorial' })
    expect(file).toContain('extends: presets.editorial,')
    expect(file).not.toContain('colors')
    expect(isPristine({ base: 'editorial' })).toBe(true)
    expect(isPristine({ base: 'editorial', colors: { light: {} } })).toBe(true)
    expect(isPristine(edited)).toBe(false)
  })

  it('round-trips the state through the URL and rejects junk', () => {
    expect(decodeState(encodeState(edited))).toEqual(edited)
    expect(decodeState('not base64 at all!')).toBeNull()
    expect(decodeState(encodeState({ ...edited, base: 'nope' as 'glyph' }))).toBeNull()
    expect(decodeState(null)).toBeNull()
  })

  it('fixes a failing pair while keeping the hue', () => {
    const state: StudioState = {
      base: 'glyph',
      colors: { light: { 'muted-foreground': 'oklch(82% 0.03 30)' } },
    }
    const theme = buildTheme(state)
    const issues = auditContrast(theme).filter(
      (i) => i.mode === 'light' && i.foreground === 'muted-foreground',
    )
    expect(issues.length).toBeGreaterThan(0)
    const fixed = fixColor(theme, issues, issues[0]!)
    expect(toOklch(fixed)?.h).toBeCloseTo(30, 0)
    for (const issue of issues)
      expect(contrastRatio(fixed, issue.background)).toBeGreaterThanOrEqual(issue.required)
    const after = buildTheme({ ...state, colors: { light: { 'muted-foreground': fixed } } })
    expect(
      auditContrast(after).filter((i) => i.mode === 'light' && i.foreground === 'muted-foreground'),
    ).toEqual([])
  })
})
