import { tv, type VariantProps } from '../../utils/tv'

export const headingStyles = /* @__PURE__ */ tv({
  // break-words: a long word in a wide display font (brutalist) wraps instead of overflowing phones.
  slots: { base: 'font-display text-balance break-words hyphens-auto text-foreground' },
  variants: {
    size: {
      display: { base: 'text-display' },
      h1: { base: 'text-h1' },
      h2: { base: 'text-h2' },
      h3: { base: 'text-h3' },
      h4: { base: 'text-h4' },
    },
  },
})

export type HeadingVariants = VariantProps<typeof headingStyles>
