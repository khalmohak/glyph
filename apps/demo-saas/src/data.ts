export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'overdue'

export interface Invoice {
  id: string
  customer: string
  email: string
  status: InvoiceStatus
  issued: Date
  due: Date
  total: number
}

export interface Customer {
  id: string
  name: string
  contact: string
  email: string
  plan: 'Starter' | 'Growth' | 'Enterprise'
  mrr: number
}

const day = 86_400_000
const ago = (n: number) => new Date(Date.now() - n * day)

export const customers: Customer[] = [
  {
    id: 'c1',
    name: 'Northwind',
    contact: 'Priya Raman',
    email: 'priya@northwind.com',
    plan: 'Growth',
    mrr: 1240,
  },
  {
    id: 'c2',
    name: 'Globex',
    contact: 'Hank Scorpio',
    email: 'hank@globex.com',
    plan: 'Enterprise',
    mrr: 8200,
  },
  {
    id: 'c3',
    name: 'Initech',
    contact: 'Bill Lumbergh',
    email: 'bill@initech.com',
    plan: 'Starter',
    mrr: 0,
  },
  {
    id: 'c4',
    name: 'Umbrella',
    contact: 'Ines Duarte',
    email: 'ines@umbrella.co',
    plan: 'Growth',
    mrr: 2380,
  },
  {
    id: 'c5',
    name: 'Hooli',
    contact: 'Marcus Lee',
    email: 'marcus@hooli.xyz',
    plan: 'Enterprise',
    mrr: 12900,
  },
  {
    id: 'c6',
    name: 'Vandelay',
    contact: 'Kenji Watanabe',
    email: 'kenji@vandelay.com',
    plan: 'Growth',
    mrr: 910,
  },
]

const statuses: InvoiceStatus[] = ['paid', 'paid', 'open', 'overdue', 'paid', 'draft', 'open']

export const invoices: Invoice[] = Array.from({ length: 37 }, (_, i) => {
  const customer = customers[i % customers.length]!
  const issued = ago(3 + i * 2)
  return {
    id: `INV-${1040 + i}`,
    customer: customer.name,
    email: customer.email,
    status: statuses[i % statuses.length]!,
    issued,
    due: new Date(issued.getTime() + 30 * day),
    total: Math.round((((i * 7919) % 14000) + 80) * 100) / 100,
  }
})

export const revenue = [
  { month: 'May', recurring: 18200, oneOff: 2100 },
  { month: 'Jun', recurring: 21400, oneOff: 1800 },
  { month: 'Jul', recurring: 23100, oneOff: 3400 },
  { month: 'Aug', recurring: 26800, oneOff: 2200 },
  { month: 'Sep', recurring: 31200, oneOff: 4100 },
  { month: 'Oct', recurring: 34900, oneOff: 2600 },
]

export const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/** Fake network call so loading states are visible. */
export function fetchCustomers(): Promise<Customer[]> {
  return new Promise((resolve) => setTimeout(() => resolve(customers), 900))
}
