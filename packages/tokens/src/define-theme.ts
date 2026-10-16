import { type DeepPartial, deepMerge, isPlainObject } from './merge'
import type { ComponentOverrides } from './register'
import type { ColorMode, ShadowScale, ThemeTokens } from './schema'

/** A fully resolved theme: every token present, shadows split per color mode. */
export interface Theme extends Omit<ThemeTokens, 'shadow'> {
  name: string
  shadow: Record<ColorMode, ShadowScale>
  components: ComponentOverrides
}

interface ThemeMeta {
  /** Unique name. Used for scoped themes (`data-glyph-theme`) and style element ids. */
  name: string
  /** Per-component defaults and slot classes. Typed by the component packages you install. */
  components?: ComponentOverrides
}

/** A standalone theme must define every token. */
export interface BaseThemeInput extends ThemeTokens, ThemeMeta {
  extends?: undefined
}

/** A theme built on another theme only overrides what differs. */
export interface ExtendedThemeInput extends DeepPartial<ThemeTokens>, ThemeMeta {
  extends: Theme
}

export type ThemeInput = BaseThemeInput | ExtendedThemeInput

function isPerMode<T>(value: unknown): value is Partial<Record<ColorMode, T>> {
  return isPlainObject(value) && ('light' in value || 'dark' in value)
}

/** Shadows may be given once for both modes or per mode; internally they are always per mode. */
function normalizeShadow(shadow: unknown): DeepPartial<Theme['shadow']> | undefined {
  if (shadow === undefined) return undefined
  if (isPerMode<ShadowScale>(shadow)) return shadow
  return { light: shadow as ShadowScale, dark: shadow as ShadowScale }
}

/**
 * Creates a theme. Pass `extends` to start from another theme (a preset or your own) and
 * override only what differs.
 *
 * ```ts
 * export default defineTheme({
 *   name: 'acme',
 *   extends: presets.glyph,
 *   colors: { dark: { primary: 'oklch(70% 0.19 45)' } },
 *   radius: { md: '6px' },
 * })
 * ```
 */
export function defineTheme(input: ThemeInput): Theme {
  const { extends: base, shadow, name, components, ...tokens } = input
  const own = { ...tokens, name, components: components ?? {}, shadow: normalizeShadow(shadow) }

  if (base === undefined) return own as Theme
  return deepMerge(base, own)
}
