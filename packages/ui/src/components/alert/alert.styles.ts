import type { StylesEntry } from '../../utils/registry'
import { themedBorder } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

// Soft fills per tone. Icon color is mixed toward the foreground so it stays readable in both modes.
export const alertStyles = /* @__PURE__ */ tv({
  slots: {
    root: ['relative flex w-full items-start gap-3 rounded-lg px-4 py-3 text-small', themedBorder],
    icon: 'mt-0.5 flex size-4 shrink-0 items-center justify-center [&>svg]:size-4',
    content: 'grid min-w-0 flex-1 gap-0.5',
    title: 'font-medium text-foreground',
    description:
      'text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2',
    action: 'flex shrink-0 items-center gap-2 self-center',
    dismiss: '-my-1 -mr-2 shrink-0',
  },
  variants: {
    tone: {
      neutral: { icon: 'text-muted-foreground' },
      info: { icon: 'text-[color-mix(in_oklab,var(--color-info)_80%,var(--color-foreground))]' },
      success: {
        icon: 'text-[color-mix(in_oklab,var(--color-success)_80%,var(--color-foreground))]',
      },
      warning: {
        icon: 'text-[color-mix(in_oklab,var(--color-warning)_80%,var(--color-foreground))]',
      },
      danger: {
        icon: 'text-[color-mix(in_oklab,var(--color-danger)_80%,var(--color-foreground))]',
      },
    },
    variant: {
      soft: {},
      outline: { root: 'bg-surface' },
    },
  },
  compoundVariants: [
    { variant: 'soft', tone: 'neutral', class: { root: 'border-border bg-muted' } },
    { variant: 'soft', tone: 'info', class: { root: 'border-info/25 bg-info/8' } },
    { variant: 'soft', tone: 'success', class: { root: 'border-success/25 bg-success/8' } },
    { variant: 'soft', tone: 'warning', class: { root: 'border-warning/30 bg-warning/10' } },
    { variant: 'soft', tone: 'danger', class: { root: 'border-danger/25 bg-danger/8' } },
    { variant: 'outline', tone: 'neutral', class: { root: 'border-border-strong' } },
    { variant: 'outline', tone: 'info', class: { root: 'border-info/50' } },
    { variant: 'outline', tone: 'success', class: { root: 'border-success/50' } },
    { variant: 'outline', tone: 'warning', class: { root: 'border-warning/60' } },
    { variant: 'outline', tone: 'danger', class: { root: 'border-danger/50' } },
  ],
  defaultVariants: { tone: 'neutral', variant: 'soft' },
})

export type AlertVariants = VariantProps<typeof alertStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Alert: StylesEntry<typeof alertStyles>
  }
}
