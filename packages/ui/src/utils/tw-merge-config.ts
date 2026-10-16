import { textTokens } from '@glyphkit/tokens'

/**
 * Teaches tailwind-merge about Glyph's custom utilities so `cn('text-h1', 'text-small')`
 * keeps only the last size instead of treating `text-h1` as a color.
 */
export const twMergeConfig = {
  extend: {
    theme: {
      text: [...textTokens],
      radius: ['pill'],
    },
  },
}
