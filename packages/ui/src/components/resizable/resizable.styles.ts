import type { StylesEntry } from '../../utils/registry'
import { tv, type VariantProps } from '../../utils/tv'

export const resizableStyles = /* @__PURE__ */ tv({
  slots: {
    group: 'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
    panel: 'min-w-0',
    // A 1px divider with a wider invisible hit area. Highlights while hovered, focused or dragged.
    handle: [
      'relative flex w-px shrink-0 items-center justify-center bg-border outline-none',
      'transition-colors duration-(--glyph-duration-fast)',
      'after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2',
      'hover:bg-border-strong data-[resize-handle-state=drag]:bg-primary',
      'focus-visible:bg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
      'data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full',
      'data-[panel-group-direction=vertical]:after:inset-x-0 data-[panel-group-direction=vertical]:after:inset-y-auto data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:top-1/2 data-[panel-group-direction=vertical]:after:h-2 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2',
    ],
    grip: 'z-10 flex h-5 w-3 items-center justify-center rounded-xs border border-border bg-surface text-faint-foreground shadow-xs in-data-[panel-group-direction=vertical]:h-3 in-data-[panel-group-direction=vertical]:w-5 [&>svg]:size-2.5 in-data-[panel-group-direction=vertical]:[&>svg]:rotate-90',
  },
})

export type ResizableVariants = VariantProps<typeof resizableStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Resizable: StylesEntry<typeof resizableStyles>
  }
}
