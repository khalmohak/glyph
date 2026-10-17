import type { MotionLevel, SpringConfig } from '@glyphui/tokens'
import { useContext, useMemo } from 'react'
import { useMediaQuery } from '../hooks/use-media-query'
import { GlyphContext } from '../provider/glyph-context'

export interface MotionSettings {
  /** The effective level: the theme's, overridden by the provider, forced to `none` by reduced motion. */
  level: MotionLevel
  /** `false` when level is `none`. Components render static markup then. */
  animate: boolean
  /** The theme's spring for overlays, indicators and layout animations. */
  spring: SpringConfig & { type: 'spring' }
  /** Theme durations in seconds, for tween animations. */
  duration: { fast: number; base: number; slow: number }
}

const defaultSpring: SpringConfig = { stiffness: 420, damping: 34 }

function seconds(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const n = Number.parseFloat(value)
  if (Number.isNaN(n)) return fallback
  return value.trim().endsWith('ms') ? n / 1000 : n
}

/**
 * How Glyph components should animate right now. Every animated component reads this, so a
 * theme's `motion.level`, the provider's `motion` prop and the visitor's reduced-motion
 * setting control all motion in one place.
 */
export function useMotionSettings(): MotionSettings {
  const context = useContext(GlyphContext)
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const motion = context?.theme.motion
  const level: MotionLevel = reduced ? 'none' : (context?.motion ?? motion?.level ?? 'subtle')
  const spring = motion?.spring ?? defaultSpring
  const durations = motion?.duration
  // Stable identity per theme, so components can depend on these in effects.
  return useMemo(
    () => ({
      level,
      animate: level !== 'none',
      spring: { type: 'spring' as const, ...spring },
      duration: {
        fast: seconds(durations?.fast, 0.12),
        base: seconds(durations?.base, 0.18),
        slow: seconds(durations?.slow, 0.28),
      },
    }),
    [level, spring, durations],
  )
}
