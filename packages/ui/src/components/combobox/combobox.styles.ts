import type { StylesEntry } from '../../utils/registry'
import { popover } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'
import { fieldControl } from '../input/input.styles'

export const comboboxStyles = tv({
  slots: {
    trigger: [
      ...fieldControl,
      'flex cursor-pointer items-center justify-between gap-2 px-3 text-left outline-none',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    value: 'flex min-w-0 flex-1 items-center gap-1 truncate',
    placeholder: 'truncate text-faint-foreground',
    chip: 'inline-flex h-5.5 max-w-40 shrink-0 items-center truncate rounded-pill bg-muted px-2 text-caption text-foreground',
    icon: 'size-4 shrink-0 text-faint-foreground',
    content: [popover, 'w-(--radix-popover-trigger-width) min-w-56 p-0'],
    search:
      'flex items-center gap-2 border-b border-border px-3 text-faint-foreground [&>svg]:size-4 [&>svg]:shrink-0',
    input:
      'h-10 w-full min-w-0 bg-transparent text-small text-foreground outline-none placeholder:text-faint-foreground',
    list: 'max-h-72 overflow-y-auto overscroll-contain p-1',
    empty: 'px-3 py-6 text-center text-small text-muted-foreground',
    item: [
      'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-small text-foreground outline-none',
      'data-[selected=true]:bg-muted data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
    ],
    itemText: 'grid min-w-0 flex-1',
    itemDescription: 'truncate text-caption text-faint-foreground',
    check: 'size-4 shrink-0 text-primary',
  },
  variants: {
    size: {
      sm: { trigger: 'min-h-(--glyph-control-sm) text-small' },
      md: { trigger: 'min-h-(--glyph-control-md) text-small' },
      lg: { trigger: 'min-h-(--glyph-control-lg) text-body' },
    },
    multiple: { true: { trigger: 'py-1', value: 'flex-wrap overflow-visible whitespace-normal' } },
  },
  defaultVariants: { size: 'md' },
})

export type ComboboxVariants = VariantProps<typeof comboboxStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Combobox: StylesEntry<typeof comboboxStyles>
  }
}
