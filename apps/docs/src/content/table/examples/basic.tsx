import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@glyphui/ui'

const members = [
  { name: 'Ada Lovelace', email: 'ada@acme.dev', role: 'Owner' },
  { name: 'Grace Hopper', email: 'grace@acme.dev', role: 'Admin' },
  { name: 'Alan Kay', email: 'alan@acme.dev', role: 'Member' },
]

export default function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.email}>
            <TableCell className="font-medium">{m.name}</TableCell>
            <TableCell className="text-muted-foreground">{m.email}</TableCell>
            <TableCell>
              <Badge>{m.role}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
