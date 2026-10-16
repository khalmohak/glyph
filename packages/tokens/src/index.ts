export {
  type BaseThemeInput,
  defineTheme,
  type ExtendedThemeInput,
  type Theme,
  type ThemeInput,
} from './define-theme'
export { type DeepPartial, deepMerge } from './merge'
export { brutalist, editorial, glyph, type PresetName, playful, presets } from './presets'
export type {
  ComponentEntry,
  ComponentName,
  ComponentOverride,
  ComponentOverrides,
  GlyphComponentRegistry,
} from './register'
export * from './schema'
export {
  modeVars,
  scopeSelector,
  staticVars,
  type ThemeCssOptions,
  themeToCss,
  tokenVar,
  tokenVarName,
} from './to-css'
