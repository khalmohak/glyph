import type { StylesEntry } from '../../utils/registry'
import { overlayMotion, themedBorder } from '../../utils/styles'
import { tv } from '../../utils/tv'

export const commandMenuStyles = /* @__PURE__ */ tv({
  slots: {
    overlay: ['fixed inset-0 z-50 bg-overlay', overlayMotion],
    content: [
      'fixed top-[12vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border-border bg-raised text-foreground shadow-lg outline-none',
      // Anchored near the top, so it grows down from its top edge.
      'origin-top animate-pop-in data-[state=closed]:animate-pop-out',
      themedBorder,
    ],
    root: 'flex w-full flex-col overflow-hidden bg-raised text-foreground',
    search:
      'flex items-center gap-2.5 border-b border-border px-4 text-faint-foreground [&>svg]:size-4 [&>svg]:shrink-0',
    input:
      'h-12 w-full min-w-0 bg-transparent text-body text-foreground outline-none placeholder:text-faint-foreground',
    list: 'max-h-[min(24rem,60vh)] overflow-y-auto overscroll-contain p-2',
    empty: 'py-10 text-center text-small text-muted-foreground',
    group: [
      'overflow-hidden',
      '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1',
      '[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-caption [&_[cmdk-group-heading]]:uppercase',
      '[&_[cmdk-group-heading]]:tracking-[0.1em] [&_[cmdk-group-heading]]:text-faint-foreground',
    ],
    item: [
      'relative flex h-10 cursor-pointer select-none items-center gap-3 rounded-md px-2.5 text-small text-foreground outline-none',
      'data-[selected=true]:bg-muted data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
    ],
    itemIcon:
      'flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4',
    itemLabel: 'min-w-0 flex-1 truncate',
    shortcut: 'ml-auto flex shrink-0 items-center gap-1',
    separator: '-mx-2 my-1.5 h-px bg-border',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    CommandMenu: StylesEntry<typeof commandMenuStyles>
  }
}
