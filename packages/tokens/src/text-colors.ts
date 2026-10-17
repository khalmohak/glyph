import { composite, contrastRatio } from './contrast'
import type { ColorScale, ColorToken, StatusTextToken } from './schema'

/** Each status text token and the tone it is derived from. */
export const statusTextTone: Record<StatusTextToken, ColorToken> = {
  'primary-text': 'primary',
  'success-text': 'success',
  'warning-text': 'warning',
  'danger-text': 'danger',
  'info-text': 'info',
}

/** Tinted backgrounds status text sits on, e.g. a soft Badge or an Alert (`bg-danger/14`). */
export const tintedSurfaceAmount = 14

/** Slightly above 4.5:1 so browser gamut mapping can't tip a color below AA. */
const TARGET = 4.6

export const mix = (color: string, percent: number, other: string) =>
  `color-mix(in oklab, ${color} ${percent}%, ${other})`

/**
 * The backgrounds a status text color must stay readable on: page, cards, subtle panels and
 * `raised` (menus, popovers), plain and with the tone's tint (a soft Badge, an Alert).
 */
export function textBackgrounds(colors: ColorScale, tone: ColorToken): string[] {
  const surfaces = [colors.background, colors.surface, colors.subtle, colors.raised]
  return [
    ...surfaces,
    ...surfaces.map((surface) => composite(colors[tone], tintedSurfaceAmount / 100, surface)),
  ]
}

/**
 * The tone itself when it is readable as text, otherwise the tone mixed toward the
 * foreground just enough to reach WCAG AA on every background in `textBackgrounds`.
 * Colors it can't parse (named colors, `var()`) are returned unchanged.
 */
export function deriveTextColor(colors: ColorScale, tone: ColorToken): string {
  let backgrounds: string[]
  try {
    backgrounds = textBackgrounds(colors, tone)
    contrastRatio(colors[tone], colors.foreground)
  } catch {
    return colors[tone]
  }
  const passes = (color: string) => backgrounds.every((bg) => contrastRatio(color, bg) >= TARGET)
  for (let percent = 100; percent > 0; percent -= 2) {
    const color = percent === 100 ? colors[tone] : mix(colors[tone], percent, colors.foreground)
    if (passes(color)) return color
  }
  return colors.foreground
}

/** Solid tones and the token for text drawn on them (button labels, solid badges). */
export const solidTones = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const
export type SolidTone = (typeof solidTones)[number]

const WHITE_INK = 'oklch(100% 0 0)'
const DARK_INK = 'oklch(20% 0.01 260)'

/**
 * Text color for a solid tone: `current` when it still reads at 4.5:1, otherwise white or
 * near-black ink, whichever contrasts more. Colors it can't parse are kept as they are.
 */
export function deriveForeground(tone: string, current: string): string {
  try {
    if (contrastRatio(current, tone) >= 4.5) return current
    return contrastRatio(WHITE_INK, tone) >= contrastRatio(DARK_INK, tone) ? WHITE_INK : DARK_INK
  } catch {
    return current
  }
}
