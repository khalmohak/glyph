import './register'
import { defineTheme, presets as tokenPresets } from '@glyphui/tokens'

/**
 * Built-in themes: the token presets from @glyphui/tokens plus per-component recipes.
 * Extend any of them in your theme file: `defineTheme({ name: 'acme', extends: presets.glyph, ... })`.
 */

/** Precise, dark-first, one electric-blue accent, layered soft shadows, Geist. */
export const glyph = tokenPresets.glyph

/** Zero radius, heavy borders, hard offset shadows, loud color. */
export const brutalist = /* @__PURE__ */ defineTheme({
  name: 'brutalist',
  extends: tokenPresets.brutalist,
  components: {
    Button: {
      className: {
        base: 'font-bold uppercase tracking-wide shadow-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-md active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
      },
    },
    Badge: { className: { base: 'font-bold uppercase' } },
    Card: { defaultVariants: { variant: 'elevated' } },
    Heading: { className: { base: 'uppercase' } },
    Input: { className: { root: 'shadow-sm focus-within:ring-0 focus-within:shadow-md' } },
  },
})

/** Serif display type, warm paper neutrals, deep green ink, hairlines instead of shadows. */
export const editorial = /* @__PURE__ */ defineTheme({
  name: 'editorial',
  extends: tokenPresets.editorial,
  components: {
    Card: { defaultVariants: { variant: 'outline' } },
    Eyebrow: { className: { base: 'font-sans tracking-[0.18em]' } },
    Button: { className: { base: 'tracking-wide' } },
  },
})

/** Pill shapes, lavender and mint, chunky rounded type, springy motion. */
export const playful = /* @__PURE__ */ defineTheme({
  name: 'playful',
  extends: tokenPresets.playful,
  components: {
    Button: {
      className: {
        base: 'font-bold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]',
      },
    },
    Card: { defaultVariants: { variant: 'elevated' } },
    Badge: { className: { base: 'font-semibold' } },
  },
})

export const presets = { glyph, brutalist, editorial, playful } as const
export type PresetName = keyof typeof presets
