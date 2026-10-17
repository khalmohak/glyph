import { colorDistance, contrastRatio } from './contrast'
import type { Theme } from './define-theme'
import {
  type ColorMode,
  type ColorScale,
  type ColorToken,
  chartTokens,
  colorModes,
  statusTextTokens,
} from './schema'
import { statusTextTone, textBackgrounds } from './text-colors'

/** Text needs 4.5:1 (WCAG AA); icons, focus rings and chart marks need 3:1. */
export const contrastMinimums = { text: 4.5, graphic: 3 } as const

/** Two chart series closer than this in OKLab are hard to tell apart. */
export const minChartDistance = 0.1

export interface ContrastIssue {
  mode: ColorMode
  kind: 'text' | 'graphic' | 'chart-distance'
  /** The token rendered on top (for `chart-distance`, the first series). */
  foreground: ColorToken
  /** The background color value (for `chart-distance`, the second series token). */
  background: string
  /** Contrast ratio, or OKLab distance for `chart-distance`. */
  value: number
  required: number
}

type Pair = [kind: 'text' | 'graphic', foreground: ColorToken, background: string]

/** The color pairs Glyph components render. Every pair must pass in every mode. */
function pairs(colors: ColorScale): Pair[] {
  const surfaces = ['background', 'surface', 'subtle', 'muted', 'raised'] as const
  const list: Pair[] = []
  for (const text of ['foreground', 'muted-foreground', 'faint-foreground'] as const)
    for (const bg of surfaces) list.push(['text', text, colors[bg]])
  for (const solid of ['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const)
    list.push(['text', `${solid}-foreground`, colors[solid]])
  // Links, field errors, Text tones and tinted badges use the status text colors.
  for (const token of statusTextTokens)
    for (const bg of textBackgrounds(colors, statusTextTone[token])) list.push(['text', token, bg])
  list.push(['graphic', 'ring', colors.background])
  for (const chart of chartTokens)
    for (const bg of ['background', 'surface'] as const) list.push(['graphic', chart, colors[bg]])
  return list
}

/**
 * Checks a theme against WCAG AA for every color pair Glyph components render, plus chart
 * series separation. Returns an empty array when the theme passes.
 *
 * ```ts
 * import { auditContrast } from '@glyphui/tokens'
 * console.table(auditContrast(theme))
 * ```
 */
export function auditContrast(theme: Theme): ContrastIssue[] {
  const issues: ContrastIssue[] = []
  for (const mode of colorModes) {
    const colors = theme.colors[mode]
    for (const [kind, fg, bg] of pairs(colors)) {
      const required = contrastMinimums[kind]
      const value = contrastRatio(colors[fg], bg)
      if (value < required)
        issues.push({ mode, kind, foreground: fg, background: bg, value, required })
    }

    chartTokens.forEach((first, i) => {
      for (const second of chartTokens.slice(i + 1)) {
        const value = colorDistance(colors[first], colors[second])
        if (value < minChartDistance)
          issues.push({
            mode,
            kind: 'chart-distance',
            foreground: first,
            background: second,
            value,
            required: minChartDistance,
          })
      }
    })
  }
  return issues
}
