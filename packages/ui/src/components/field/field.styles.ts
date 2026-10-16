import { tv, type VariantProps } from '../../utils/tv'

export const fieldStyles = tv({
  slots: {
    root: 'grid gap-1.5',
    label: '',
    required: 'text-danger',
    text: 'grid gap-0.5',
    description: 'text-small text-faint-foreground',
    error: 'text-small font-medium text-danger',
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
