import { describe, expect, it } from 'vitest'
import { editorial, glyph } from './presets'
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

describe('themeToCss shadows', () => {
  it('writes a shadow of `none` as an empty shadow so focus rings still compose', () => {
    // Tailwind combines shadow and ring in one box-shadow list; `none` inside a list makes
    // the whole declaration invalid, which removed focus rings from editorial's buttons.
    const css = themeToCss(editorial)
    expect(editorial.shadow.light.sm).toBe('none')
    expect(css).toContain('--glyph-shadow-sm: 0 0 #0000;')
    expect(css).not.toMatch(/--glyph-shadow-\w+: none;/)
  })
})

describe('themeToCss safety', () => {
  // Themes can come from data (per-tenant branding, a theme editor), so a value must never
  // close its rule or the <style> element it is rendered into.
  const hostile = {
    ...glyph,
    colors: {
      ...glyph.colors,
      light: { ...glyph.colors.light, primary: 'red; } body { display: none' },
      dark: { ...glyph.colors.dark, primary: 'blue</style><script>alert(1)</script>' },
    },
  }

  it('keeps every value inside its declaration', () => {
    const css = themeToCss(hostile)
    expect(css).not.toContain('body {')
    // The hostile text stays inside the one --glyph-primary declaration.
    expect(css).not.toMatch(/^\s*(body|display)/m)
    expect(css).not.toMatch(/<\/style/i)
    expect(css).not.toContain('<script')
    // Every rule still opens and closes exactly once.
    expect(css.split('{').length).toBe(css.split('}').length)
  })

  it('escapes the theme name in its scope selector', () => {
    const selector = scopeSelector({ name: 'x"] body, [a="' })
    expect(selector).toBe('[data-glyph-theme="x\\"] body, [a=\\""]')
    const css = themeToCss(glyph, { selector })
    expect(css).not.toMatch(/^body/m)
  })
})
