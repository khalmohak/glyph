import type { ComponentEntry } from '@glyphui/tokens'
import { tv, type VariantProps } from '@glyphui/ui'

// biome-ignore lint/suspicious/noExplicitAny: matches tailwind-variants' own constraint
type StylesEntry<T extends ((...args: any) => any) & { slots: unknown }> = ComponentEntry<
  VariantProps<T>,
  Extract<keyof NonNullable<T['slots']>, string>
>

export const authLayoutStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'grid min-h-dvh bg-background lg:grid-cols-2',
    main: 'flex flex-col px-4 py-6 sm:px-8',
    brand: 'flex items-center gap-2 text-small font-semibold',
    content: 'flex flex-1 items-center justify-center py-10',
    footer: 'text-center text-caption text-muted-foreground',
    aside: [
      'relative isolate hidden overflow-hidden border-l-(length:--glyph-border-width) border-border bg-subtle lg:flex lg:flex-col lg:justify-end lg:p-12',
      // A soft glow in the theme's accent, behind whatever the app puts in the panel.
      'before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(70%_55%_at_75%_15%,color-mix(in_oklab,var(--color-primary)_16%,transparent),transparent)]',
    ],
  },
  variants: {
    side: {
      right: {},
      left: { main: 'lg:order-2', aside: 'border-r-(length:--glyph-border-width) border-l-0' },
    },
  },
  defaultVariants: { side: 'right' },
})

export const socialButtonsStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'grid gap-2',
    icon: 'size-4 shrink-0 [&_svg]:size-4',
  },
  variants: {
    layout: {
      stack: {},
      row: { root: 'grid-cols-[repeat(auto-fit,minmax(0,1fr))]' },
    },
  },
  defaultVariants: { layout: 'stack' },
})

export const authNoticeStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'grid justify-items-center gap-3 text-center',
    icon: 'flex size-11 items-center justify-center rounded-pill bg-primary/12 text-primary-text [&_svg]:size-5',
    email: 'font-medium text-foreground',
  },
})

export const userMenuStyles = /* @__PURE__ */ tv({
  slots: {
    trigger:
      'inline-flex min-w-0 cursor-pointer items-center gap-2 rounded-md p-1 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
    details: 'grid min-w-0',
    name: 'truncate text-small font-medium text-foreground',
    email: 'truncate text-caption text-muted-foreground',
    header: 'grid gap-0.5 px-2 py-1.5',
  },
  variants: {
    compact: {
      true: { details: 'sr-only' },
      false: {},
    },
  },
  defaultVariants: { compact: false },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    AuthLayout: StylesEntry<typeof authLayoutStyles>
    SocialButtons: StylesEntry<typeof socialButtonsStyles>
    AuthNotice: StylesEntry<typeof authNoticeStyles>
    UserMenu: StylesEntry<typeof userMenuStyles>
  }
}
