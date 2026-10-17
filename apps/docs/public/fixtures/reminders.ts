import { sendEmail } from './email'
import { logger } from './logger'

export interface Invoice {
  id: string
  total: number
  dueDate: Date
  /** Customers can opt out of reminders. */
  remindersEnabled: boolean
}

const DAY = 86_400_000

export async function remind(invoice: Invoice): Promise<boolean> {
  if (!invoice.remindersEnabled) return false
  const days = Math.round((Date.now() - invoice.dueDate.getTime()) / DAY)
  if (days <= 0) return false
  await sendEmail(invoice.id, `Your invoice is ${days} days overdue`)
  logger.info('reminder sent', { id: invoice.id, days })
  return true
}
