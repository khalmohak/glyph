import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { tv } from '../../utils/tv'

export const tableStyles = tv({
  slots: {
    wrapper: 'relative w-full overflow-x-auto',
    table: 'w-full caption-bottom border-collapse text-small tabular-nums',
    header: '[&_tr]:border-b [&_tr]:border-border',
    body: '[&_tr:last-child]:border-0',
    row: 'border-b border-border transition-colors duration-(--glyph-duration-fast) hover:bg-muted/50 data-[state=selected]:bg-primary/6',
    head: 'h-10 whitespace-nowrap px-3 first:pl-4 last:pr-4 text-left align-middle text-caption font-medium text-muted-foreground [&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-0',
    cell: 'px-3 py-2.5 align-middle first:pl-4 last:pr-4 [&:has([role=checkbox])]:pr-0',
    caption: 'mt-3 text-small text-faint-foreground',
  },
})

const s = tableStyles()

function useSlots() {
  return useComponentConfig('Table', {})[1]
}

/** Semantic table primitives styled by the theme. For sorting and pagination use DataTable. */
export function Table({ className, ...props }: ComponentProps<'table'>) {
  const slots = useSlots()
  return (
    <div data-slot="table-wrapper" className={s.wrapper({ class: slots.wrapper })}>
      <table
        data-slot="table"
        className={s.table({ class: [slots.table, className] })}
        {...props}
      />
    </div>
  )
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  const slots = useSlots()
  return (
    <thead
      data-slot="table-header"
      className={s.header({ class: [slots.header, className] })}
      {...props}
    />
  )
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  const slots = useSlots()
  return (
    <tbody
      data-slot="table-body"
      className={s.body({ class: [slots.body, className] })}
      {...props}
    />
  )
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  const slots = useSlots()
  return (
    <tr data-slot="table-row" className={s.row({ class: [slots.row, className] })} {...props} />
  )
}

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  const slots = useSlots()
  return (
    <th data-slot="table-head" className={s.head({ class: [slots.head, className] })} {...props} />
  )
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  const slots = useSlots()
  return (
    <td data-slot="table-cell" className={s.cell({ class: [slots.cell, className] })} {...props} />
  )
}

export function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
  const slots = useSlots()
  return (
    <caption
      data-slot="table-caption"
      className={s.caption({ class: [slots.caption, className] })}
      {...props}
    />
  )
}
