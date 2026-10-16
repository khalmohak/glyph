import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Form',
  slug: 'form',
  category: 'Patterns',
  status: 'stable',
  description:
    'Schema-validated forms: typed field names, wired labels and errors, server errors on the right field, submit progress.',
  entry: '@glyphui/ui/form',
  exports: ['Form', 'FormField', 'FormSubmit', 'FormError', 'useForm', 'formErrorStyles'],
  source: 'patterns/form/form.tsx',
  propsOf: 'FormField',
  examples: [
    {
      file: 'signup',
      title: 'Validation and server errors',
      description: 'Try an invalid email, or "taken@acme.dev" for a server error.',
    },
  ],
  notes: [
    'Works with any Standard Schema validator: zod, valibot, arktype.',
    'Return { errors } from onSubmit for field errors; throw to show a form-level error in FormError.',
    'Requires react-hook-form and @hookform/resolvers as peer dependencies.',
  ],
})
