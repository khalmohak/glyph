import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@glyphui/ui'

const invoices = [
  { id: 'INV-1042', date: 'Oct 2', amount: 1240.0 },
  { id: 'INV-1043', date: 'Oct 9', amount: 86.5 },
  { id: 'INV-1044', date: 'Oct 14', amount: 12900.75 },
]

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function Example() {
  return (
    <Table>
      <TableCaption>Invoices for October 2026</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell className="font-mono text-caption">{inv.id}</TableCell>
            <TableCell>{inv.date}</TableCell>
            <TableCell className="text-right">{usd.format(inv.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
