import { describe, expect, it } from 'vitest'
import { glyph } from './presets'
import { scopeSelector, themeToCss, tokenVar } from './to-css'

describe('themeToCss', () => {
  const css = themeToCss(glyph)

  it('emits light tokens and static tokens on :root', () => {
    const root = css.slice(0, css.indexOf('}'))
    expect(root).toContain(':root {')
    expect(root).toContain(`--glyph-primary: ${glyph.colors.light.primary};`)
    expect(root).toContain(`--glyph-radius-md: ${glyph.radius.md};`)
    expect(root).toContain(`--glyph-text-h1-leading: ${glyph.text.h1.lineHeight};`)
    expect(root).toContain('--glyph-font-features: normal;')
  })

  it('emits dark tokens for data-mode and for the system preference', () => {
    expect(css).toContain('[data-mode="dark"] {')
    expect(css).toContain('@media (prefers-color-scheme: dark)')
    expect(css).toContain(`--glyph-primary: ${glyph.colors.dark.primary};`)
  })

  it('scopes every rule to the selector when one is given', () => {
    const selector = scopeSelector(glyph)
    const scoped = themeToCss(glyph, { selector })
    expect(scoped).not.toContain(':root')
    const selectors = scoped.split('\n').filter((line) => line.endsWith('{'))
    for (const line of selectors) expect(line).toContain(selector)
  })

  it('places forced-light scope rules after dark rules so they win ties', () => {
    const scoped = themeToCss(glyph, { selector: scopeSelector(glyph) })
    expect(scoped.lastIndexOf('[data-mode="light"]')).toBeGreaterThan(
      scoped.indexOf('[data-mode="dark"]'),
    )
  })
})

describe('tokenVar', () => {
  it('references the generated custom property', () => {
    expect(tokenVar('primary')).toBe('var(--glyph-primary)')
  })
})
