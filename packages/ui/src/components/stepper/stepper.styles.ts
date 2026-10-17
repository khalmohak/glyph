import type { StylesEntry } from '../../utils/registry'
import { focusRing, themedBorder, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const stepperStyles = tv({
  slots: {
    root: 'flex w-full list-none p-0',
    step: 'relative flex min-w-0',
    trigger: ['flex min-w-0 rounded-md text-left', focusRing],
    indicator: [
      'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-pill text-small font-medium tabular-nums [&>svg]:size-4',
      themedBorder,
      transition,
    ],
    connector: 'absolute transition-colors duration-(--glyph-duration-base)',
    text: 'grid min-w-0 gap-0.5',
    title: 'text-small font-medium',
    description: 'text-caption text-muted-foreground',
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'items-start',
        step: 'flex-1 flex-col items-center text-center',
        trigger: 'flex-col items-center gap-2 text-center',
        connector: 'top-4 right-[calc(-50%+1.25rem)] left-[calc(50%+1.25rem)] h-px',
        text: 'px-2',
      },
      vertical: {
        root: 'flex-col',
        step: 'gap-3 pb-7 last:pb-0',
        trigger: 'items-start gap-3',
        connector: 'top-9.5 bottom-1.5 left-4 w-px -translate-x-1/2',
        text: 'pt-1.5',
      },
    },
    status: {
      complete: {
        indicator: 'border-primary bg-primary text-primary-foreground',
        connector: 'bg-primary',
        title: 'text-foreground',
      },
      current: {
        indicator: 'border-primary bg-surface text-primary-text ring-4 ring-primary/15',
        connector: 'bg-border',
        title: 'text-foreground',
      },
      upcoming: {
        indicator: 'border-border bg-surface text-muted-foreground',
        connector: 'bg-border',
        title: 'text-muted-foreground',
      },
      error: {
        indicator: 'border-danger bg-danger text-danger-foreground',
        connector: 'bg-border',
        title: 'text-danger-text',
      },
    },
    clickable: {
      true: {
        trigger: 'cursor-pointer hover:[&_[data-slot=stepper-title]]:underline underline-offset-4',
      },
    },
  },
  defaultVariants: { orientation: 'horizontal', status: 'upcoming' },
})

export type StepperVariants = VariantProps<typeof stepperStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Stepper: StylesEntry<typeof stepperStyles>
  }
}
