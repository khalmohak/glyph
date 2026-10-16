import type { ComponentName, GlyphComponentRegistry } from '@glyphkit/tokens'
import { useContext } from 'react'
import { GlyphContext } from '../provider/glyph-context'

type SlotsOf<K extends ComponentName> = GlyphComponentRegistry[K] extends {
  slots: infer S extends string
}
  ? S
  : never

export type SlotClasses<K extends ComponentName> = Partial<Record<SlotsOf<K>, string>>

interface LooseOverride {
  defaultVariants?: Record<string, unknown>
  className?: Record<string, string>
}

/**
 * Applies the theme's per-component settings (`theme.components[name]`):
 * fills unset variant props from `defaultVariants` and returns the extra slot classes.
 * Every styled component calls this first.
 */
export function useComponentConfig<K extends ComponentName, P extends object>(
  name: K,
  props: P,
): [props: P, slotClasses: SlotClasses<K>] {
  const theme = useContext(GlyphContext)?.theme
  const override = theme?.components[name] as LooseOverride | undefined
  if (!override) return [props, {}]

  let merged = props
  const defaults = override.defaultVariants
  if (defaults) {
    merged = { ...props }
    for (const [key, value] of Object.entries(defaults)) {
      if ((merged as Record<string, unknown>)[key] === undefined) {
        ;(merged as Record<string, unknown>)[key] = value
      }
    }
  }
  return [merged, (override.className ?? {}) as SlotClasses<K>]
}
