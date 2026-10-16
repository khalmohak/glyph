import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { tv, type VariantProps } from '../../utils/tv'

export const stackStyles = tv({
  base: 'flex',
  variants: {
    direction: { column: 'flex-col', row: 'flex-row' },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
      10: 'gap-10',
      12: 'gap-12',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
    wrap: { true: 'flex-wrap' },
  },
  defaultVariants: { direction: 'column', gap: 4 },
})

export interface StackProps extends ComponentProps<'div'>, VariantProps<typeof stackStyles> {
  asChild?: boolean
}

/** Flex layout with spacing from the scale. `direction="row"` for horizontal. */
export function Stack({
  direction,
  gap,
  align,
  justify,
  wrap,
  asChild,
  className,
  ...props
}: StackProps) {
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <Comp
      data-slot="stack"
      className={stackStyles({ direction, gap, align, justify, wrap, class: className })}
      {...props}
    />
  )
}
