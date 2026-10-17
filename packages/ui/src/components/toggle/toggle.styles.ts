import type { StylesEntry } from '../../utils/registry'
import { focusRing, themedBorder, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const toggleStyles = /* @__PURE__ */ tv({
  slots: {
    base: [
      'inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-muted-foreground',
      transition,
      focusRing,
      'hover:bg-muted hover:text-foreground',
      'data-[state=on]:bg-muted data-[state=on]:text-foreground',
      'disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
    ],
    group: 'inline-flex items-center gap-1',
  },
  variants: {
    variant: {
      default: { base: 'bg-transparent' },
      outline: {
        base: ['border-border bg-transparent shadow-xs hover:border-border-strong', themedBorder],
      },
    },
    size: {
      sm: { base: 'h-(--glyph-control-sm) min-w-(--glyph-control-sm) px-2 text-caption' },
      md: { base: 'h-(--glyph-control-md) min-w-(--glyph-control-md) px-2.5 text-small' },
      lg: { base: 'h-(--glyph-control-lg) min-w-(--glyph-control-lg) px-3 text-small' },
    },
  },
  defaultVariants: { variant: 'default', size: 'md' },
})

export type ToggleVariants = VariantProps<typeof toggleStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Toggle: StylesEntry<typeof toggleStyles>
  }
}
