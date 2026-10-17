import { auditContrast, type Theme } from '@glyphui/tokens'
import { useEffect } from 'react'

// Bundlers replace process.env.NODE_ENV; the typeof guard keeps unbundled browsers safe.
declare const process: { env: { NODE_ENV?: string } } | undefined

const audited = new WeakSet<Theme>()

/**
 * In development, warns once per theme when its colors fail WCAG contrast (text below
 * 4.5:1, rings and charts below 3:1), naming each pair, so a brand color that makes button
 * labels unreadable is caught before a user does. Does nothing in production builds.
 */
export function useContrastWarning(theme: Theme): void {
  useEffect(() => {
    if (typeof process === 'undefined' || process.env.NODE_ENV === 'production') return
    if (audited.has(theme)) return
    audited.add(theme)
    let issues: ReturnType<typeof auditContrast>
    try {
      issues = auditContrast(theme)
    } catch {
      return // colors the audit can't parse (named colors, var()) aren't checked
    }
    if (issues.length === 0) return
    const lines = issues.map(
      (issue) =>
        `  ${issue.mode}: ${issue.foreground} on ${issue.background} is ${issue.value.toFixed(2)}${issue.kind === 'chart-distance' ? '' : ':1'}, needs ${issue.required}${issue.kind === 'chart-distance' ? ' apart' : ':1'}`,
    )
    console.warn(
      `[glyph] Theme "${theme.name}" has ${issues.length} contrast ${issues.length === 1 ? 'issue' : 'issues'}. Set the colors explicitly in your theme file, or check them with auditContrast(theme):\n${lines.join('\n')}`,
    )
  }, [theme])
}
