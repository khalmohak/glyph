import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Heading,
  Input,
  Select,
  SelectItem,
  Text,
} from '@glyphkit/ui'
import { Form, FormError, FormField, FormSubmit, useForm } from '@glyphkit/ui/form'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { CodeBlock } from '../../components/code-block'

const plans = ['free', 'pro', 'team'] as const

const schema = z.object({
  name: z.string().trim().min(2, 'Use at least 2 characters'),
  slug: z
    .string()
    .trim()
    .min(3, 'Use at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes only'),
  email: z.email('Enter a valid email address'),
  plan: z.enum(plans, 'Choose a plan'),
  terms: z.literal(true, 'Accept the terms to continue'),
})

type Values = z.output<typeof schema>

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const snippet = `
const form = useForm({ schema, defaultValues })

<Form form={form} onSubmit={async (values) => {
  const res = await api.createWorkspace(values)
  if (res.taken) return { errors: { slug: 'That URL is taken' } }
}}>
  <FormField control={form.control} name="slug" label="URL">
    {(field) => <Input prefix="glyph.app/" {...field} />}
  </FormField>
  <FormSubmit>Create workspace</FormSubmit>   // spinner while submitting
</Form>
`

export function FormDemo() {
  const [created, setCreated] = useState<Values | null>(null)
  const form = useForm({
    schema,
    defaultValues: { name: '', slug: '', email: '', plan: undefined, terms: false as true },
  })

  async function onSubmit(values: Values) {
    await wait(900)
    if (values.slug === 'acme') return { errors: { slug: 'That URL is taken. Try acme-hq.' } }
    if (values.slug === 'error')
      throw new Error('The server didn’t respond. Your details are saved; try again.')
    setCreated(values)
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="grid gap-4">
        <Heading level={3}>Forms</Heading>
        <Text tone="muted">
          Validated by any Standard Schema library. Field names are type-checked against the schema,
          and server errors land on the right field. Try the URL{' '}
          <code className="font-mono text-foreground">acme</code> for a server error, or{' '}
          <code className="font-mono text-foreground">error</code> for a failed request.
        </Text>
        <CodeBlock title="create-workspace.tsx" code={snippet} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a workspace</CardTitle>
          <CardDescription>You can change all of this later in settings.</CardDescription>
        </CardHeader>
        {created ? (
          <div className="grid justify-items-start gap-3" role="status">
            <Badge tone="success" dot>
              Created
            </Badge>
            <p className="flex items-center gap-2 text-body">
              <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
              <span>
                <span className="font-medium">{created.name}</span> is live at{' '}
                <span className="font-mono">glyph.app/{created.slug}</span>
              </span>
            </p>
            <button
              type="button"
              className="cursor-pointer text-small text-primary hover:underline"
              onClick={() => {
                setCreated(null)
                form.reset()
              }}
            >
              Create another
            </button>
          </div>
        ) : (
          <Form form={form} onSubmit={onSubmit} className="grid gap-4">
            <FormError />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="name" label="Workspace name" required>
                {(field) => (
                  <Input placeholder="Acme Inc." autoComplete="organization" {...field} />
                )}
              </FormField>
              <FormField control={form.control} name="slug" label="URL" required>
                {(field) => <Input prefix="glyph.app/" placeholder="acme" {...field} />}
              </FormField>
            </div>
            <FormField
              control={form.control}
              name="email"
              label="Billing email"
              description="Invoices and receipts go here."
              required
            >
              {(field) => (
                <Input
                  type="email"
                  placeholder="billing@acme.com"
                  autoComplete="email"
                  {...field}
                />
              )}
            </FormField>
            <FormField control={form.control} name="plan" label="Plan" required>
              {(field) => (
                <Select<(typeof plans)[number]>
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Choose a plan"
                >
                  <SelectItem value="free">Free · 3 projects</SelectItem>
                  <SelectItem value="pro">Pro · $16 per seat</SelectItem>
                  <SelectItem value="team">Team · $28 per seat</SelectItem>
                </Select>
              )}
            </FormField>
            <FormField
              control={form.control}
              name="terms"
              label="I accept the terms of service"
              orientation="horizontal"
            >
              {(field) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  onBlur={field.onBlur}
                />
              )}
            </FormField>
            <FormSubmit className="mt-1 justify-self-start">Create workspace</FormSubmit>
          </Form>
        )}
      </Card>
    </div>
  )
}
