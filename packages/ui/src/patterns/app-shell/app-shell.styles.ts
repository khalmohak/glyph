import { focusRing, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const appShellStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'flex w-full bg-background',
    sidebar: 'hidden shrink-0 md:flex',
    main: 'flex min-w-0 flex-1 flex-col',
    mobileBar: [
      'flex h-14 shrink-0 items-center gap-2 border-b-border px-3 md:hidden',
      'border-b-(length:--glyph-border-width)',
    ],
    overlay:
      'fixed inset-0 z-50 bg-overlay data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
    drawer:
      'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] shadow-lg data-[state=open]:animate-sheet-in-left data-[state=closed]:animate-sheet-out-left outline-none [&>[data-slot=sidebar]]:w-full',
  },
  variants: {
    layout: {
      page: {
        root: 'min-h-dvh',
        sidebar: 'sticky top-0 h-dvh',
        mobileBar: 'sticky top-0 z-30 bg-background/80 backdrop-blur-xl',
      },
      embedded: {
        root: 'h-full min-h-0 overflow-hidden',
        sidebar: 'h-full',
        main: 'overflow-y-auto',
      },
    },
  },
  defaultVariants: { layout: 'page' },
})

export type AppShellVariants = VariantProps<typeof appShellStyles>

export const sidebarStyles = /* @__PURE__ */ tv({
  slots: {
    root: [
      // Isolated so the active item's sliding highlight stays under every item's label.
      'group/sidebar isolate flex h-full w-60 flex-col overflow-hidden border-r-border bg-subtle',
      'border-r-(length:--glyph-border-width)',
      'transition-[width] duration-(--glyph-duration-base) ease-standard data-[collapsed=true]:w-15',
    ],
    // A minimum height, not a fixed one: a workspace switcher can sit under the brand.
    header: 'flex min-h-14 shrink-0 flex-wrap items-center gap-2 px-3 py-2',
    content: 'flex flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden px-3 py-3',
    section: 'flex flex-col gap-0.5',
    sectionLabel:
      'mb-1 truncate px-2 font-mono text-caption uppercase tracking-[0.1em] text-faint-foreground group-data-[collapsed=true]/sidebar:sr-only',
    item: [
      'relative flex h-8 w-full shrink-0 cursor-pointer items-center gap-2.5 rounded-sm px-2 text-small font-medium text-muted-foreground',
      transition,
      focusRing,
      'hover:bg-muted hover:text-foreground',
      'aria-[current=page]:text-foreground',
      'group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:px-0',
    ],
    /** The active item's background and accent bar. Slides between items on navigation. */
    itemIndicator: [
      'pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-muted',
      'before:absolute before:inset-y-1.5 before:-left-3 before:w-0.5 before:rounded-r-pill before:bg-primary',
    ],
    itemIcon: 'flex size-4 shrink-0 items-center justify-center [&>svg]:size-4',
    itemLabel: 'min-w-0 flex-1 truncate text-left group-data-[collapsed=true]/sidebar:sr-only',
    itemBadge:
      'ml-auto font-mono text-caption text-faint-foreground tabular-nums group-data-[collapsed=true]/sidebar:hidden',
    footer: [
      'mt-auto flex shrink-0 items-center gap-2 border-t-border px-3 py-3 group-data-[collapsed=true]/sidebar:justify-center',
      'border-t-(length:--glyph-border-width)',
    ],
  },
})

export const navbarStyles = /* @__PURE__ */ tv({
  slots: {
    root: [
      'top-0 z-40 w-full border-b-transparent',
      'border-b-(length:--glyph-border-width)',
      'transition-[background-color,border-color,backdrop-filter] duration-(--glyph-duration-base) ease-standard',
    ],
    inner: 'flex h-16 items-center gap-6',
    brand: 'flex shrink-0 items-center gap-2 font-display text-h4 text-foreground',
    links: 'hidden items-center gap-1 md:flex',
    link: [
      'rounded-sm px-3 py-1.5 text-small font-medium text-muted-foreground',
      transition,
      focusRing,
      'hover:text-foreground aria-[current=page]:text-foreground',
    ],
    actions: 'ml-auto hidden items-center gap-2 md:flex',
    menuButton: 'ml-auto md:hidden',
    overlay:
      'fixed inset-0 z-50 bg-overlay data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
    panel: [
      'fixed inset-x-0 top-0 z-50 max-h-dvh overflow-y-auto border-b-border bg-background px-4 pb-6 shadow-lg outline-none animate-slide-in-top data-[state=closed]:animate-pop-out',
      'border-b-(length:--glyph-border-width)',
    ],
    panelHeader: 'flex h-16 items-center justify-between',
    panelLinks: 'flex flex-col gap-1',
    panelLink: [
      'rounded-md px-3 py-2.5 text-body font-medium text-muted-foreground',
      focusRing,
      'hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground',
    ],
    panelActions: [
      'mt-4 flex flex-col gap-2 border-t-border pt-4',
      'border-t-(length:--glyph-border-width)',
    ],
  },
  variants: {
    sticky: { true: { root: 'sticky' }, false: { root: 'relative' } },
    blur: {
      true: {
        root: 'data-[scrolled=true]:border-b-border data-[scrolled=true]:bg-background/72 data-[scrolled=true]:backdrop-blur-xl data-[scrolled=true]:backdrop-saturate-150',
      },
      false: { root: 'border-b-border bg-background' },
    },
  },
  defaultVariants: { sticky: true, blur: true },
})

export const pageHeaderStyles = /* @__PURE__ */ tv({
  slots: {
    root: [
      'flex flex-col gap-4 border-b-border pb-5 sm:flex-row sm:items-end sm:justify-between',
      'border-b-(length:--glyph-border-width)',
    ],
    text: 'grid min-w-0 gap-1',
    eyebrow: 'font-mono text-caption uppercase tracking-[0.12em] text-faint-foreground',
    title: 'font-display text-h3 text-foreground',
    description: 'max-w-2xl text-small text-muted-foreground',
    actions: 'flex shrink-0 flex-wrap items-center gap-2',
  },
})
