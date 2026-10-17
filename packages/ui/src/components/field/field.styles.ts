import { tv, type VariantProps } from '../../utils/tv'

export const fieldStyles = tv({
  slots: {
    root: 'grid gap-1.5',
    label: '',
    labelRow: 'flex items-center justify-between gap-2',
    labelAction: 'text-small',
    required: 'text-danger-text',
    text: 'grid gap-0.5',
    description: 'text-small text-faint-foreground',
    error: 'text-small font-medium text-danger-text',
  },
  variants: {
    orientation: {
      vertical: {},
      horizontal: {
        root: 'grid-cols-[auto_1fr] items-start gap-x-3 [&>[data-slot=field-text]]:col-start-2',
      },
    },
  },
  defaultVariants: { orientation: 'vertical' },
})

export type FieldVariants = VariantProps<typeof fieldStyles>
