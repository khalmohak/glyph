import { DatePicker } from '@glyphui/ui'
import { Form, FormField, FormSubmit, useForm } from '@glyphui/ui/form'
import { z } from 'zod'

const schema = z.object({
  dueDate: z.date('Choose a due date'),
})

export default function Example() {
  const form = useForm({ schema, defaultValues: { dueDate: undefined } })
  return (
    <Form form={form} onSubmit={() => {}} className="grid w-72 gap-4">
      <FormField control={form.control} name="dueDate" label="Due date" required>
        {(field) => <DatePicker value={field.value} onValueChange={field.onChange} />}
      </FormField>
      <FormSubmit className="justify-self-start">Save</FormSubmit>
    </Form>
  )
}
