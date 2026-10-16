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
  'overlay',
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
export const colorModes = ['light', 'dark'] as const

export type ColorToken = (typeof colorTokens)[number]
export type RadiusToken = (typeof radiusTokens)[number]
export type ShadowToken = (typeof shadowTokens)[number]
export type FontToken = (typeof fontTokens)[number]
export type TextToken = (typeof textTokens)[number]
export type DurationToken = (typeof durationTokens)[number]
export type EasingToken = (typeof easingTokens)[number]
export type ControlSize = (typeof controlSizes)[number]
export type ColorMode = (typeof colorModes)[number]

/** Semantic tones shared by components that communicate status (Badge, Alert, ...). */
export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

export type ColorScale = Record<ColorToken, string>
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
  }
  /** Heights of interactive controls (buttons, inputs, selects). Sets the theme's density. */
  control: Record<ControlSize, string>
}
