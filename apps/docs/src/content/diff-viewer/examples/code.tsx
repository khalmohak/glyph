import { DiffViewer } from '@glyphui/viewers/diff'

const before = `export async function remind(invoice: Invoice) {
  const days = Math.round((Date.now() - invoice.dueDate.getTime()) / 86_400_000)
  if (days > 0) {
    await sendEmail(invoice.id, \`Your invoice is \${days} days overdue\`)
  }
}

export function isOverdue(invoice: Invoice) {
  return invoice.dueDate.getTime() < Date.now()
}

export function label(invoice: Invoice) {
  return invoice.id
}
`

const after = `export async function remind(invoice: Invoice): Promise<boolean> {
  if (!invoice.remindersEnabled) return false
  const days = Math.round((Date.now() - invoice.dueDate.getTime()) / DAY)
  if (days <= 0) return false
  await sendEmail(invoice.id, \`Your invoice is \${days} days overdue\`)
  return true
}

export function isOverdue(invoice: Invoice) {
  return invoice.dueDate.getTime() < Date.now()
}

export function label(invoice: Invoice) {
  return \`\${invoice.id} · \${invoice.customer}\`
}
`

export default function Example() {
  return (
    <DiffViewer
      oldValue={before}
      newValue={after}
      fileName="src/reminders.ts"
      context={1}
      className="w-full"
    />
  )
}
