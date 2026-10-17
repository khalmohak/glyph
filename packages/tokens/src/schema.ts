/**
 * The token schema. Every theme provides every token, so components can rely on all of them.
 * Arrays are the source of truth; the types are derived from them.
 */

export const colorTokens = [
  'background',
  'foreground',
  'subtle',
  'surface',
  'raised',
  'muted',
  'muted-foreground',
  'faint-foreground',
  'border',
  'border-strong',
  'input',
  'ring',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'success',
  'success-foreground',
  'warning',
  'warning-foreground',
  'danger',
  'danger-foreground',
  'info',
  'info-foreground',
  'primary-text',
  'success-text',
  'warning-text',
  'danger-text',
  'info-text',
  'overlay',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
] as const

/** Categorical colors for chart series, in order. Optional in theme input. */
export const chartTokens = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] as const

/**
 * Status colors used as text (links, field errors, tinted badges). Optional in theme input:
 * `defineTheme` derives each one from its tone so it meets WCAG AA on the theme's surfaces.
 */
export const statusTextTokens = [
  'primary-text',
  'success-text',
  'warning-text',
  'danger-text',
  'info-text',
] as const

export const radiusTokens = ['xs', 'sm', 'md', 'lg', 'xl', 'pill'] as const
export const shadowTokens = ['xs', 'sm', 'md', 'lg'] as const
export const fontTokens = ['sans', 'display', 'serif', 'mono'] as const
export const textTokens = [
  'display',
  'h1',
  'h2',
  'h3',
  'h4',
  'lead',
  'body',
  'small',
  'caption',
] as const
export const durationTokens = ['fast', 'base', 'slow'] as const
export const easingTokens = ['standard', 'emphasized'] as const
export const controlSizes = ['sm', 'md', 'lg'] as const
export const motionLevels = ['none', 'subtle', 'expressive'] as const
export const colorModes = ['light', 'dark'] as const

export type ColorToken = (typeof colorTokens)[number]
export type ChartToken = (typeof chartTokens)[number]
export type StatusTextToken = (typeof statusTextTokens)[number]
export type RadiusToken = (typeof radiusTokens)[number]
export type ShadowToken = (typeof shadowTokens)[number]
export type FontToken = (typeof fontTokens)[number]
export type TextToken = (typeof textTokens)[number]
export type DurationToken = (typeof durationTokens)[number]
export type EasingToken = (typeof easingTokens)[number]
export type ControlSize = (typeof controlSizes)[number]
/**
 * How much a theme animates. `none` renders everything statically, `subtle` keeps motion
 * short and purposeful, `expressive` adds springy overshoot and staggered entrances.
 * A visitor's reduced-motion preference always turns animation off.
 */
export type MotionLevel = (typeof motionLevels)[number]

/** A physical spring, as used by the `motion` library. Higher damping means less bounce. */
export interface SpringConfig {
  stiffness: number
  damping: number
  mass?: number
}
export type ColorMode = (typeof colorModes)[number]

/** Semantic tones shared by components that communicate status (Badge, Alert, ...). */
export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

export type ColorScale = Record<ColorToken, string>
/**
 * Colors as a theme provides them. Chart colors are optional: missing ones fall back to
 * primary, info, success, warning and danger. Status text colors are optional too: missing
 * ones are derived from their tone so they stay readable.
 */
export type ColorScaleInput = Record<Exclude<ColorToken, ChartToken | StatusTextToken>, string> &
  Partial<Record<ChartToken | StatusTextToken, string>>
export type ShadowScale = Record<ShadowToken, string>

/** A value that is either shared by both color modes or set per mode. */
export type ModeValue<T> = T | { light: T; dark: T }

export interface TextStep {
  size: string
  lineHeight: string
  tracking: string
  weight: string
}

export interface ThemeTokens {
  colors: { light: ColorScale; dark: ColorScale }
  radius: Record<RadiusToken, string>
  shadow: ModeValue<ShadowScale>
  font: Record<FontToken, string> & { features?: string }
  text: Record<TextToken, TextStep>
  border: { width: string }
  motion: {
    duration: Record<DurationToken, string>
    easing: Record<EasingToken, string>
    /** Default `subtle`. */
    level?: MotionLevel
    /** The spring behind overlays, indicators and layout animations. */
    spring?: SpringConfig
  }
  /** Heights of interactive controls (buttons, inputs, selects). Sets the theme's density. */
  control: Record<ControlSize, string>
}
