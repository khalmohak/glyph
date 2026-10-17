import { Badge, defineTheme, presets, ThemeScope } from '@glyphui/ui'
import { createColumnHelper, DataTable } from '@glyphui/ui/data-table'
import { type Invoice, invoices, statusTone, usd } from '../data'

// In your theme file: every DataTable becomes compact and borderless, with a tinted header.
const theme = defineTheme({
  name: 'ledger',
  extends: presets.glyph,
  components: {
    DataTable: {
      defaultVariants: { variant: 'plain', density: 'compact' },
      className: {
        head: 'bg-subtle text-[0.6875rem] tracking-wide [&_button]:uppercase',
        row: 'odd:bg-subtle/40',
      },
    },
  },
})

const col = createColumnHelper<Invoice>()
const columns = [
  col.accessor('id', { header: 'Invoice' }),
  col.accessor('customer', { header: 'Customer' }),
  col.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <Badge tone={statusTone[info.getValue()]} className="capitalize">
        {info.getValue()}
      </Badge>
    ),
  }),
  col.accessor('total', {
    header: 'Total',
    cell: (info) => usd.format(info.getValue()),
    meta: { align: 'right' },
  }),
]

export default function Example() {
  return (
    <ThemeScope theme={theme} className="w-full bg-transparent">
      <DataTable aria-label="Invoices" data={invoices} columns={columns} pageSize={6} />
    </ThemeScope>
  )
}
