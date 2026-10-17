import type { StylesEntry } from '../../utils/registry'
import { focusRing, transition } from '../../utils/styles'
import { tv } from '../../utils/tv'

export const calendarStyles = tv({
  slots: {
    root: 'relative w-fit p-3 text-small text-foreground',
    months: 'relative flex flex-col gap-6 sm:flex-row',
    month: 'grid content-start gap-3',
    monthCaption: 'flex h-8 items-center justify-center px-9',
    captionLabel: 'font-medium text-foreground',
    nav: 'pointer-events-none absolute inset-x-3 top-3 z-10 flex items-center justify-between',
    navButton: [
      'pointer-events-auto inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground',
      'hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
      transition,
      focusRing,
    ],
    chevron: 'size-4',
    monthGrid: 'border-collapse',
    weekdays: '',
    weekday: 'size-9 p-0 text-caption font-normal text-faint-foreground',
    weeks: '',
    week: '',
    day: 'size-9 p-0 text-center align-middle',
    dayButton: [
      'inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-small tabular-nums text-foreground',
      'hover:bg-muted',
      transition,
      focusRing,
    ],
    // Selected days keep primary-foreground on primary, whatever else applies to them.
    today: '[&>button]:font-semibold [&:not([data-selected])>button]:text-primary-text',
    selected:
      '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90',
    outside: '[&:not([data-selected])>button]:text-faint-foreground',
    disabled: '[&>button]:pointer-events-none [&>button]:opacity-35 [&>button]:line-through',
    rangeStart: 'rounded-l-md bg-primary/14',
    rangeMiddle:
      'bg-primary/14 [&>button]:rounded-none [&>button]:bg-transparent! [&>button]:text-foreground! [&>button]:hover:bg-primary/10!',
    rangeEnd: 'rounded-r-md bg-primary/14',
    hidden: 'invisible',
    footer: 'pt-2 text-small text-muted-foreground',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Calendar: StylesEntry<typeof calendarStyles>
  }
}
