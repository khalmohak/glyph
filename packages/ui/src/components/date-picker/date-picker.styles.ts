import type { StylesEntry } from '../../utils/registry'
import { popover } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'
import { fieldControl } from '../input/input.styles'

export const datePickerStyles = /* @__PURE__ */ tv({
  slots: {
    // Holds the trigger and the clear button side by side (a button can't contain a button).
    root: 'relative flex w-full min-w-0',
    trigger: [
      ...fieldControl,
      'flex cursor-pointer items-center gap-2 px-3 text-left outline-none',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    icon: 'size-4 shrink-0 text-faint-foreground',
    value: 'min-w-0 flex-1 truncate',
    placeholder: 'min-w-0 flex-1 truncate text-faint-foreground',
    clear: [
      'absolute top-1/2 right-2.5 inline-flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xs text-faint-foreground outline-none hover:bg-muted hover:text-foreground [&>svg]:size-3.5',
      'focus-visible:ring-2 focus-visible:ring-ring',
    ],
    content: [popover, 'origin-(--radix-popover-content-transform-origin) w-auto p-0'],
    layout: 'flex flex-col sm:flex-row',
    presets:
      'flex gap-1 overflow-x-auto border-b border-border p-2 sm:w-40 sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0',
    preset:
      'shrink-0 cursor-pointer rounded-sm px-2 py-1.5 text-left text-small whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground',
  },
  variants: {
    size: {
      sm: { trigger: 'h-(--glyph-control-sm) text-small' },
      md: { trigger: 'h-(--glyph-control-md) text-small' },
      lg: { trigger: 'h-(--glyph-control-lg) text-body' },
    },
  },
  defaultVariants: { size: 'md' },
})

export type DatePickerVariants = VariantProps<typeof datePickerStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    DatePicker: StylesEntry<typeof datePickerStyles>
  }
}
