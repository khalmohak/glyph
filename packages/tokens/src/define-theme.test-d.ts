// Type-level contract tests. Checked by `tsc` (pnpm typecheck), never executed.
import { defineTheme } from './define-theme'
import { glyph } from './presets'

// A standalone theme must provide every token.
// @ts-expect-error - missing colors, radius, font, ...
defineTheme({ name: 'incomplete' })

// An extended theme may override any subset.
defineTheme({ name: 'ok', extends: glyph, radius: { md: '4px' } })

// Unknown tokens are rejected.
// @ts-expect-error - 'brand' is not a color token
defineTheme({ name: 'typo', extends: glyph, colors: { light: { brand: 'red' } } })

// Text steps only accept their four properties.
// @ts-expect-error - 'family' is not part of a text step
defineTheme({ name: 'typo2', extends: glyph, text: { h1: { family: 'serif' } } })
