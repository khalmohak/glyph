import { sendEmail } from './email'

export interface Invoice {
  id: string
  total: number
  dueDate: Date
}

export async function remind(invoice: Invoice) {
  const days = Math.round((Date.now() - invoice.dueDate.getTime()) / 86_400_000)
  if (days > 0) {
    await sendEmail(invoice.id, `Your invoice is ${days} days overdue`)
  }
}
