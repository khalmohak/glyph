import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import type { StylesEntry } from '../../utils/registry'
import { tv, type VariantProps } from '../../utils/tv'

type Cols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl'

// Literal class names per breakpoint so Tailwind's scanner generates them.
const colClasses: Record<Breakpoint, Record<Cols, string>> = {
  base: {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12',
  },
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
    7: 'sm:grid-cols-7',
    8: 'sm:grid-cols-8',
    9: 'sm:grid-cols-9',
    10: 'sm:grid-cols-10',
    11: 'sm:grid-cols-11',
    12: 'sm:grid-cols-12',
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    7: 'md:grid-cols-7',
    8: 'md:grid-cols-8',
    9: 'md:grid-cols-9',
    10: 'md:grid-cols-10',
    11: 'md:grid-cols-11',
    12: 'md:grid-cols-12',
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
    7: 'lg:grid-cols-7',
    8: 'lg:grid-cols-8',
    9: 'lg:grid-cols-9',
    10: 'lg:grid-cols-10',
    11: 'lg:grid-cols-11',
    12: 'lg:grid-cols-12',
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
    7: 'xl:grid-cols-7',
    8: 'xl:grid-cols-8',
    9: 'xl:grid-cols-9',
    10: 'xl:grid-cols-10',
    11: 'xl:grid-cols-11',
    12: 'xl:grid-cols-12',
  },
}

export type GridCols = Cols | Partial<Record<Breakpoint, Cols>>

function colsToClasses(cols: GridCols): string {
  if (typeof cols === 'number') return colClasses.base[cols]
  return (Object.entries(cols) as [Breakpoint, Cols][])
    .map(([bp, n]) => colClasses[bp][n])
    .join(' ')
}

export const gridStyles = tv({
  slots: { base: 'grid' },
  variants: {
    gap: {
      0: { base: 'gap-0' },
      1: { base: 'gap-1' },
      2: { base: 'gap-2' },
      3: { base: 'gap-3' },
      4: { base: 'gap-4' },
      5: { base: 'gap-5' },
      6: { base: 'gap-6' },
      8: { base: 'gap-8' },
      10: { base: 'gap-10' },
      12: { base: 'gap-12' },
    },
    align: {
      start: { base: 'items-start' },
      center: { base: 'items-center' },
      end: { base: 'items-end' },
      stretch: { base: 'items-stretch' },
    },
  },
  defaultVariants: { gap: 4 },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Grid: StylesEntry<typeof gridStyles>
  }
}

export interface GridProps extends ComponentProps<'div'>, VariantProps<typeof gridStyles> {
  /** Column count, or per breakpoint: `{ base: 1, sm: 2, lg: 4 }`. Default 1. */
  cols?: GridCols
  asChild?: boolean
}

/** Responsive equal-width columns with spacing from the scale. */
export function Grid(inProps: GridProps) {
  const [props, slots] = useComponentConfig('Grid', inProps)
  const { cols = 1, gap, align, asChild, className, ...rest } = props
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <Comp
      data-slot="grid"
      className={gridStyles({ gap, align }).base({
        class: [colsToClasses(cols), slots.base, className],
      })}
      {...rest}
    />
  )
}
