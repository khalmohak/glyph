import { describe, expect, it } from 'vitest'
import { defineTheme } from './define-theme'
import { brutalist, glyph, presets } from './presets'
import { colorTokens } from './schema'

describe('defineTheme', () => {
  it('normalizes a shared shadow scale into per-mode scales', () => {
    expect(brutalist.shadow.light.md).toBe(brutalist.shadow.dark.md)
    expect(glyph.shadow.light.md).not.toBe(glyph.shadow.dark.md)
  })

  it('deep-merges an extended theme and keeps untouched tokens', () => {
    const theme = defineTheme({
      name: 'acme',
      extends: glyph,
      colors: { dark: { primary: 'red' } },
      radius: { md: '2px' },
    })
    expect(theme.name).toBe('acme')
    expect(theme.colors.dark.primary).toBe('red')
    expect(theme.colors.light.primary).toBe(glyph.colors.light.primary)
    expect(theme.radius.md).toBe('2px')
    expect(theme.radius.lg).toBe(glyph.radius.lg)
    expect(theme.text.h1).toEqual(glyph.text.h1)
  })

  it('applies a partial, mode-less shadow override to both modes', () => {
    const theme = defineTheme({ name: 'x', extends: glyph, shadow: { md: 'none' } })
    expect(theme.shadow.light.md).toBe('none')
    expect(theme.shadow.dark.md).toBe('none')
    expect(theme.shadow.dark.lg).toBe(glyph.shadow.dark.lg)
  })

  it('does not mutate the base theme', () => {
    const before = structuredClone(glyph)
    defineTheme({ name: 'y', extends: glyph, colors: { light: { primary: 'blue' } } })
    expect(glyph).toEqual(before)
  })

  it('every preset defines every color token in both modes', () => {
    for (const theme of Object.values(presets)) {
      for (const mode of ['light', 'dark'] as const) {
        for (const token of colorTokens) {
          expect(theme.colors[mode][token], `${theme.name}.${mode}.${token}`).toBeTruthy()
        }
      }
    }
  })
})
