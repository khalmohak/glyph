import { toast } from '@glyphui/ui'
import { createColumnHelper, DataTable, editableCell } from '@glyphui/ui/data-table'
import { useState } from 'react'

interface Seat {
  id: string
  name: string
  role: 'admin' | 'member' | 'billing'
  seats: number
}

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'billing', label: 'Billing' },
]

const col = createColumnHelper<Seat>()
const columns = [
  col.accessor('name', {
    header: 'Team',
    cell: editableCell<Seat, string>({
      validate: (value) => (value.trim().length < 2 ? 'Use at least 2 characters' : null),
    }),
  }),
  col.accessor('role', {
    header: 'Default role',
    cell: editableCell<Seat, string>({ type: 'select', options: roles }),
  }),
  col.accessor('seats', {
    header: 'Seats',
    cell: editableCell<Seat, number>({
      type: 'number',
      validate: (value) => (value === null || value < 1 ? 'At least 1 seat' : null),
    }),
    meta: { align: 'right' },
  }),
]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Example() {
  const [rows, setRows] = useState<Seat[]>([
    { id: 't1', name: 'Design', role: 'member', seats: 8 },
    { id: 't2', name: 'Engineering', role: 'member', seats: 24 },
    { id: 't3', name: 'Finance', role: 'billing', seats: 3 },
  ])
  return (
    <DataTable
      aria-label="Teams"
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      pageSize={false}
      onCellEdit={async ({ rowId, columnId, value }) => {
        await wait(500)
        // The server refuses more than 50 seats: the cell rolls back and explains why.
        if (columnId === 'seats' && Number(value) > 50) {
          toast.error('Plans include up to 50 seats per team')
          throw new Error('Plans include up to 50 seats per team')
        }
        setRows((current) =>
          current.map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)),
        )
      }}
    />
  )
}
