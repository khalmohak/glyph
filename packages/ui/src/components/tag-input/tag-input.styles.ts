import type { StylesEntry } from '../../utils/registry'
import { tv, type VariantProps } from '../../utils/tv'
import { fieldControl } from '../input/input.styles'

export const tagInputStyles = tv({
  slots: {
    root: 'grid gap-1.5',
    frame: [
      ...fieldControl,
      'flex cursor-text flex-wrap items-center gap-1.5 px-2 py-1',
      'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20',
      'data-invalid:focus-within:ring-danger/20',
      'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50',
    ],
    tag: 'inline-flex h-6 max-w-full items-center gap-1 rounded-pill bg-muted pr-1 pl-2.5 text-caption text-foreground',
    tagLabel: 'truncate',
    remove:
      'inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-pill text-muted-foreground hover:bg-border-strong/40 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring [&>svg]:size-3',
    input:
      'h-7 min-w-24 flex-1 bg-transparent px-1 text-foreground outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed',
    message: 'text-small font-medium text-danger',
  },
  variants: {
    size: {
      sm: { frame: 'min-h-(--glyph-control-sm) text-small' },
      md: { frame: 'min-h-(--glyph-control-md) text-small' },
      lg: { frame: 'min-h-(--glyph-control-lg) text-body' },
    },
  },
  defaultVariants: { size: 'md' },
})

export type TagInputVariants = VariantProps<typeof tagInputStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    TagInput: StylesEntry<typeof tagInputStyles>
  }
}
