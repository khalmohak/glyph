import { Input, Text } from '@glyphui/ui'
import { Form, FormError, FormField, FormSubmit, useForm } from '@glyphui/ui/form'
import { useState } from 'react'
import { z } from 'zod'

const schema = z.object({
  name: z.string().trim().min(2, 'Use at least 2 characters'),
  email: z.email('Enter a valid email address'),
})

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Example() {
  const [done, setDone] = useState<string | null>(null)
  const form = useForm({ schema, defaultValues: { name: '', email: '' } })

  if (done) return <Text>Welcome aboard, {done}.</Text>

  return (
    <Form
      form={form}
      className="grid max-w-sm gap-4"
      onSubmit={async (values) => {
        await wait(700)
        if (values.email === 'taken@acme.dev')
          return { errors: { email: 'That email is already registered.' } }
        setDone(values.name)
      }}
    >
      <FormError />
      <FormField control={form.control} name="name" label="Name" required>
        {(field) => <Input autoComplete="name" {...field} />}
      </FormField>
      <FormField control={form.control} name="email" label="Email" required>
        {(field) => <Input type="email" autoComplete="email" {...field} />}
      </FormField>
      <FormSubmit className="justify-self-start">Create account</FormSubmit>
    </Form>
  )
}
