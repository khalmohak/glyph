import { brutalist } from './brutalist'
import { editorial } from './editorial'
import { glyph } from './glyph'
import { playful } from './playful'

export { brutalist, editorial, glyph, playful }

/** All built-in presets, keyed by name. */
export const presets = { glyph, brutalist, editorial, playful } as const
export type PresetName = keyof typeof presets
