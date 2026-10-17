import { type DeepPartial, deepMerge, isPlainObject } from './merge'
import type { ComponentOverrides } from './register'
import {
  type ChartToken,
  type ColorMode,
  type ColorScale,
  type ColorScaleInput,
  chartTokens,
  colorModes,
  type ShadowScale,
  type StatusTextToken,
  statusTextTokens,
  type ThemeTokens,
} from './schema'
import { deriveForeground, deriveTextColor, solidTones, statusTextTone } from './text-colors'

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

/** A standalone theme must define every token except the optional chart colors. */
export interface BaseThemeInput extends Omit<ThemeTokens, 'colors'>, ThemeMeta {
  colors: { light: ColorScaleInput; dark: ColorScaleInput }
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

  const theme = base === undefined ? (own as Theme) : deepMerge(base, own)
  return withTextColors(withChartColors(withForegrounds(theme, input)), input, base)
}

/**
 * A theme that changes a solid tone but not the text on it (say a brighter `primary` and no
 * `primary-foreground`) keeps the base's text color, which may no longer be readable. Then
 * that text becomes white or dark ink, whichever reads better. Explicit values are kept.
 */
function withForegrounds(theme: Theme, input: ThemeInput): Theme {
  let colors: Theme['colors'] | undefined
  for (const mode of colorModes) {
    const own = input.colors?.[mode] as Partial<ColorScale> | undefined
    if (!own) continue
    for (const tone of solidTones) {
      const fg = `${tone}-foreground` as const
      if (own[tone] === undefined || own[fg] !== undefined) continue
      const scale = (colors ?? theme.colors)[mode]
      const next = deriveForeground(scale[tone], scale[fg])
      if (next === scale[fg]) continue
      colors ??= { light: { ...theme.colors.light }, dark: { ...theme.colors.dark } }
      colors[mode][fg] = next
    }
  }
  return colors ? { ...theme, colors } : theme
}

/** Status text colors each theme derived (rather than set), so extensions re-derive them. */
const derivedText = new WeakMap<Theme, Record<ColorMode, Set<StatusTextToken>>>()

/**
 * Fills in status text colors the theme does not set, derived from the final tone and
 * surface colors. Derived values are recomputed for every theme, so a theme that extends
 * another and changes `primary` also gets a matching `primary-text`.
 */
function withTextColors(theme: Theme, input: ThemeInput, base: Theme | undefined): Theme {
  const inherited = base && derivedText.get(base)
  const derived: Record<ColorMode, Set<StatusTextToken>> = { light: new Set(), dark: new Set() }
  const colors = { light: { ...theme.colors.light }, dark: { ...theme.colors.dark } }

  for (const mode of colorModes) {
    const ownColors = input.colors?.[mode] as Partial<ColorScale> | undefined
    for (const token of statusTextTokens) {
      const setHere = ownColors?.[token] !== undefined
      const setByBase =
        base?.colors[mode][token] !== undefined && !(inherited?.[mode].has(token) ?? false)
      if (setHere || setByBase) continue
      colors[mode][token] = deriveTextColor(colors[mode], statusTextTone[token])
      derived[mode].add(token)
    }
  }

  const result = { ...theme, colors }
  derivedText.set(result, derived)
  return result
}

/** Chart colors a theme leaves out reuse its status colors, so every series stays distinct. */
const chartFallback: Record<ChartToken, keyof ColorScale> = {
  'chart-1': 'primary',
  'chart-2': 'info',
  'chart-3': 'success',
  'chart-4': 'warning',
  'chart-5': 'danger',
}

function withChartColors(theme: Theme): Theme {
  const complete = colorModes.every((mode) =>
    chartTokens.every((token) => theme.colors[mode][token] !== undefined),
  )
  if (complete) return theme
  const fill = (scale: ColorScale): ColorScale => {
    const filled = { ...scale }
    for (const token of chartTokens) filled[token] ??= scale[chartFallback[token]]
    return filled
  }
  return { ...theme, colors: { light: fill(theme.colors.light), dark: fill(theme.colors.dark) } }
}
