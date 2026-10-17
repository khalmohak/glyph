import type { Theme } from './define-theme'
import type { ColorMode } from './schema'
import { defaultSpring, springEasing } from './spring'

const PREFIX = '--glyph'

/** The CSS custom property name for a token, e.g. `tokenVar('primary')` → `--glyph-primary`. */
export function tokenVarName(path: string): string {
  return `${PREFIX}-${path}`
}

/** A `var()` reference to a token, for inline styles and CSS-in-JS. */
export function tokenVar(path: string): string {
  return `var(${tokenVarName(path)})`
}

type Vars = Record<string, string>

/** Variables that do not change between light and dark. */
export function staticVars(theme: Theme): Vars {
  const vars: Vars = {}
  for (const [key, value] of Object.entries(theme.radius)) vars[`radius-${key}`] = value
  for (const [key, value] of Object.entries(theme.font)) {
    vars[key === 'features' ? 'font-features' : `font-${key}`] = value
  }
  for (const [key, step] of Object.entries(theme.text)) {
    vars[`text-${key}`] = step.size
    vars[`text-${key}-leading`] = step.lineHeight
    vars[`text-${key}-tracking`] = step.tracking
    vars[`text-${key}-weight`] = step.weight
  }
  vars['border-width'] = theme.border.width
  for (const [key, value] of Object.entries(theme.motion.duration)) vars[`duration-${key}`] = value
  for (const [key, value] of Object.entries(theme.motion.easing)) vars[`ease-${key}`] = value
  const spring = springEasing(theme.motion.spring ?? defaultSpring)
  vars['ease-spring'] = spring.easing
  vars['duration-spring'] = `${spring.duration}ms`
  for (const [key, value] of Object.entries(theme.control)) vars[`control-${key}`] = value
  vars['font-features'] ??= 'normal'
  return vars
}

/** Variables that differ per color mode: colors and shadows. */
export function modeVars(theme: Theme, mode: ColorMode): Vars {
  const vars: Vars = { ...theme.colors[mode] }
  for (const [key, value] of Object.entries(theme.shadow[mode])) {
    // Tailwind puts the shadow and the focus ring in one box-shadow list, and `none` inside a
    // list makes the whole value invalid, which would drop the focus ring. Use an empty shadow.
    vars[`shadow-${key}`] = String(value).trim() === 'none' ? '0 0 #0000' : value
  }
  return vars
}

/**
 * Themes can come from data (per-tenant branding, a theme editor), so a value must stay a
 * single declaration: no characters that end it (`;`), open or close a rule (`{` `}`), start
 * a comment, escape the delimiter (`\`) or close the surrounding `<style>` element.
 */
function safeValue(value: unknown): string {
  return String(value)
    .replace(/\/\*|\*\//g, '')
    .replace(/[;{}<>\\\r\n]/g, '')
    .trim()
}

/** Token names become custom property names; keep them to identifier characters. */
function safeName(key: string): string {
  return key.replace(/[^a-zA-Z0-9-]/g, '')
}

function block(selector: string, vars: Vars, extra = ''): string {
  const body = Object.entries(vars)
    .map(([key, value]) => `  ${tokenVarName(safeName(key))}: ${safeValue(value)};`)
    .join('\n')
  return `${selector} {\n${body}${extra ? `\n  ${extra}` : ''}\n}`
}

export interface ThemeCssOptions {
  /**
   * Scope the theme to an attribute selector instead of `:root`, e.g. `[data-glyph-theme="x"]`.
   * Used by `ThemeScope` to render several themes on one page.
   */
  selector?: string
}

/**
 * Compiles a theme to CSS custom properties.
 *
 * Color mode is read from a `data-mode="light|dark"` attribute on any ancestor (normally
 * `<html>`). Without the attribute, the root theme follows `prefers-color-scheme`.
 */
export function themeToCss(theme: Theme, options: ThemeCssOptions = {}): string {
  const light = modeVars(theme, 'light')
  const dark = modeVars(theme, 'dark')
  const statics = staticVars(theme)
  const s = options.selector

  if (!s) {
    return [
      block(':root', { ...statics, ...light }, 'color-scheme: light;'),
      `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-mode])', dark, 'color-scheme: dark;')}\n}`,
      block('[data-mode="dark"]', dark, 'color-scheme: dark;'),
      block('[data-mode="light"]', light, 'color-scheme: light;'),
    ].join('\n\n')
  }

  // Order matters: an explicit light scope must win the tie against a dark ancestor.
  return [
    block(s, { ...statics, ...light }, 'color-scheme: light;'),
    block(
      `[data-mode="dark"] ${s}, ${s}[data-mode="dark"], ${s} [data-mode="dark"]`,
      dark,
      'color-scheme: dark;',
    ),
    block(`${s}[data-mode="light"], ${s} [data-mode="light"]`, light, 'color-scheme: light;'),
  ].join('\n\n')
}

/** The attribute selector `ThemeScope` uses for a theme. */
export function scopeSelector(theme: Pick<Theme, 'name'>): string {
  // Escaped as a CSS string so it matches the attribute value exactly, whatever the name is.
  const name = String(theme.name)
    .replace(/["\\]/g, '\\$&')
    .replace(/\n/g, '\\a ')
    .replace(/</g, '\\3c ')
  return `[data-glyph-theme="${name}"]`
}
