import {
  Button,
  DatePicker,
  Input,
  Modal,
  ModalClose,
  NumberInput,
  Select,
  SelectItem,
  toast,
} from '@glyphui/ui'
import { Form, FormError, FormField, FormSubmit, useForm } from '@glyphui/ui/form'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

const customers = ['Northwind', 'Globex', 'Initech', 'Umbrella']

const schema = z.object({
  customer: z.string().min(1, 'Choose a customer'),
  amount: z.number('Enter an amount').positive('Must be more than zero'),
  due: z.date('Choose a due date'),
  memo: z.string().max(140, 'Keep it under 140 characters'),
})

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function Example() {
  const [open, setOpen] = useState(false)
  const form = useForm({
    schema,
    defaultValues: { customer: '', amount: undefined, due: undefined, memo: '' },
  })

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset()
        setOpen(next)
      }}
      title="New invoice"
      description="The customer gets an email with a payment link."
      trigger={<Button leftIcon={<Plus />}>New invoice</Button>}
      footer={
        <>
          <ModalClose asChild>
            <Button variant="outline">Cancel</Button>
          </ModalClose>
          {/* Outside <Form>, so it gets the form explicitly. */}
          <FormSubmit form={form}>Create invoice</FormSubmit>
        </>
      }
    >
      <Form
        form={form}
        className="grid gap-4"
        onSubmit={async (values) => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          if (values.amount > 50_000) {
            return { errors: { amount: 'Invoices over $50,000 need approval.' } }
          }
          toast.success('Invoice created', {
            description: `${values.customer} · ${usd.format(values.amount)}`,
          })
          setOpen(false)
          form.reset()
        }}
      >
        <FormError />
        <FormField control={form.control} name="customer" label="Customer" required>
          {(field) => (
            <Select
              placeholder="Choose a customer"
              value={field.value}
              onValueChange={field.onChange}
            >
              {customers.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </Select>
          )}
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="amount" label="Amount" required>
            {(field) => (
              <NumberInput
                value={field.value ?? null}
                onValueChange={(value) => field.onChange(value ?? undefined)}
                min={0}
                locale="en-US"
                formatOptions={{ style: 'currency', currency: 'USD' }}
              />
            )}
          </FormField>
          <FormField control={form.control} name="due" label="Due date" required>
            {(field) => (
              <DatePicker value={field.value} onValueChange={field.onChange} minDate={new Date()} />
            )}
          </FormField>
        </div>
        <FormField
          control={form.control}
          name="memo"
          label="Memo"
          description="Shown on the invoice."
        >
          {(field) => <Input placeholder="October usage" {...field} />}
        </FormField>
      </Form>
    </Modal>
  )
}
