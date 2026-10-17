import {
  Async,
  Avatar,
  Badge,
  Button,
  Card,
  DescriptionItem,
  DescriptionList,
  EmptyState,
  Input,
  PageHeader,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Text,
  useAsync,
} from '@glyphui/ui'
import { Search, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { type Customer, fetchCustomers, invoices, usd } from '../data'

const planTone = { Starter: 'neutral', Growth: 'primary', Enterprise: 'success' } as const

export function CustomersPage() {
  const result = useAsync(fetchCustomers, [])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Customer | null>(null)

  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone you bill, with their plan and monthly revenue."
        actions={
          <Button size="sm" leftIcon={<UserPlus />}>
            Add customer
          </Button>
        }
      />
      <Input
        aria-label="Search customers"
        placeholder="Search customers…"
        prefix={<Search />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />
      <Async result={result}>
        {(all) => {
          const list = all.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
          if (list.length === 0)
            return (
              <EmptyState
                icon={<Search />}
                title="No customers match"
                description={`Nothing found for “${query}”.`}
                action={
                  <Button size="sm" variant="outline" onClick={() => setQuery('')}>
                    Clear search
                  </Button>
                }
              />
            )
          return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((customer) => (
                <Card key={customer.id} variant="interactive" asChild>
                  <button type="button" className="text-left" onClick={() => setOpen(customer)}>
                    <div className="flex items-center gap-3">
                      <Avatar name={customer.contact} />
                      <div className="min-w-0">
                        <Text weight="medium">{customer.name}</Text>
                        <Text size="small" tone="muted" className="truncate">
                          {customer.contact}
                        </Text>
                      </div>
                      <Badge tone={planTone[customer.plan]} className="ml-auto">
                        {customer.plan}
                      </Badge>
                    </div>
                    <Text size="small" tone="muted">
                      {usd.format(customer.mrr)} / month
                    </Text>
                  </button>
                </Card>
              ))}
            </div>
          )
        }}
      </Async>

      <Sheet open={open !== null} onOpenChange={(next) => !next && setOpen(null)}>
        <SheetContent>
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>{open.name}</SheetTitle>
                <SheetDescription>{open.email}</SheetDescription>
              </SheetHeader>
              <SheetBody>
                <DescriptionList>
                  <DescriptionItem term="Contact">{open.contact}</DescriptionItem>
                  <DescriptionItem term="Plan">{open.plan}</DescriptionItem>
                  <DescriptionItem term="MRR">{usd.format(open.mrr)}</DescriptionItem>
                  <DescriptionItem term="Invoices">
                    {invoices.filter((i) => i.customer === open.name).length}
                  </DescriptionItem>
                </DescriptionList>
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
