import type { StylesEntry } from '../../utils/registry'
import { focusRing } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const linkStyles = /* @__PURE__ */ tv({
  slots: {
    base: [
      'inline-flex items-baseline gap-1 rounded-xs font-medium',
      // Underline drawn as a background so it can animate its width.
      'bg-[linear-gradient(currentColor,currentColor)] bg-[position:0_100%] bg-no-repeat',
      'transition-[background-size,color] duration-(--glyph-duration-base) ease-standard',
      focusRing,
    ],
    icon: 'size-3 shrink-0 self-center opacity-70',
  },
  variants: {
    tone: {
      default: { base: 'text-foreground' },
      muted: { base: 'text-muted-foreground hover:text-foreground' },
      primary: { base: 'text-primary-text' },
    },
    underline: {
      hover: {
        base: 'bg-[length:0%_1px] hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px]',
      },
      always: { base: 'bg-[length:100%_1px] hover:bg-[length:100%_2px]' },
      none: { base: 'bg-none' },
    },
  },
  defaultVariants: { tone: 'primary', underline: 'hover' },
})

export type LinkVariants = VariantProps<typeof linkStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Link: StylesEntry<typeof linkStyles>
  }
}
