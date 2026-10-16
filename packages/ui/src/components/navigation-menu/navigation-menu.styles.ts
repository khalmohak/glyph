import type { StylesEntry } from '../../utils/registry'
import { focusRing, themedBorder, transition } from '../../utils/styles'
import { tv } from '../../utils/tv'

const topLevel = [
  'group inline-flex h-9 cursor-pointer select-none items-center justify-center gap-1 rounded-md px-3 text-small font-medium text-muted-foreground',
  transition,
  focusRing,
  'hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground',
  'data-active:text-foreground',
]

export const navigationMenuStyles = tv({
  slots: {
    root: 'relative z-10 flex max-w-max flex-1 items-center justify-center',
    list: 'group flex flex-1 list-none items-center justify-center gap-1',
    item: 'relative',
    trigger: topLevel,
    chevron:
      'size-3 text-faint-foreground transition-transform duration-(--glyph-duration-base) ease-standard group-data-[state=open]:rotate-180',
    content: 'top-0 left-0 w-full p-2 animate-fade-in md:absolute md:w-auto',
    viewportWrapper: 'absolute top-full left-0 flex justify-center',
    viewport: [
      'relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-[calc(100vw-2rem)] origin-top overflow-hidden rounded-lg border-border bg-raised text-foreground shadow-lg animate-pop-in',
      'md:w-(--radix-navigation-menu-viewport-width)',
      'transition-[width,height] duration-(--glyph-duration-base) ease-standard',
      themedBorder,
    ],
    link: topLevel,
    card: [
      'flex select-none gap-3 rounded-md p-3 text-foreground no-underline outline-none',
      transition,
      focusRing,
      'hover:bg-muted focus-visible:bg-muted',
    ],
    cardIcon:
      'flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground shadow-xs [&_svg]:size-4',
    cardText: 'grid min-w-0 gap-0.5',
    cardTitle: 'text-small font-medium text-foreground',
    cardDescription: 'text-small text-muted-foreground',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    NavigationMenu: StylesEntry<typeof navigationMenuStyles>
  }
}
