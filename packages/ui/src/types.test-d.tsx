// Type-level contract tests. Checked by `tsc` (pnpm typecheck), never executed.
import { z } from 'zod'
import { defineTheme, glyph, SegmentedControl } from './index'
import { FormField, useForm } from './patterns/form'

// Theme component overrides are typed from each component's real variants and slots.
defineTheme({
  name: 'ok',
  extends: glyph,
  components: {
    Button: {
      defaultVariants: { size: 'lg', variant: 'outline' },
      className: { base: 'uppercase' },
    },
    Card: { className: { root: 'shadow-none', title: 'italic' } },
  },
})

defineTheme({
  name: 'bad-variant',
  extends: glyph,
  // @ts-expect-error - 'xl' is not a Button size
  components: { Button: { defaultVariants: { size: 'xl' } } },
})

defineTheme({
  name: 'bad-slot',
  extends: glyph,
  // @ts-expect-error - Card has no 'image' slot
  components: { Card: { className: { image: 'rounded-none' } } },
})

defineTheme({
  name: 'bad-component',
  extends: glyph,
  // @ts-expect-error - no component named 'Buton'
  components: { Buton: {} },
})

// Form field names come from the schema.
const schema = z.object({ email: z.email(), age: z.number() })
function FormTypes() {
  const form = useForm({ schema, defaultValues: { email: '', age: 0 } })
  return (
    <>
      <FormField control={form.control} name="email">
        {(field) => <input {...field} />}
      </FormField>
      {/* @ts-expect-error - 'emial' is not a field in the schema */}
      <FormField control={form.control} name="emial">
        {() => null}
      </FormField>
    </>
  )
}

// SegmentedControl infers its value type from the options.
function SegmentedTypes() {
  return (
    <SegmentedControl
      aria-label="Plan"
      options={[
        { value: 'free', label: 'Free' },
        { value: 'pro', label: 'Pro' },
      ]}
      onValueChange={(value) => {
        const plan: 'free' | 'pro' = value
        // @ts-expect-error - value is 'free' | 'pro', not any string
        const other: 'team' = value
        return [plan, other]
      }}
    />
  )
}

export { FormTypes, SegmentedTypes }
