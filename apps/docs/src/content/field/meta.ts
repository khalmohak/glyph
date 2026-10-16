import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Field',
  slug: 'field',
  category: 'Forms',
  status: 'stable',
  description:
    'Wraps one control with its label, description and error, and wires the ARIA attributes between them.',
  entry: '@glyphui/ui',
  exports: ['Field', 'FieldContext', 'useFieldControl', 'fieldStyles'],
  source: 'components/field/field.tsx',
  propsOf: 'Field',
  examples: [
    { file: 'basic', title: 'Label and description' },
    {
      file: 'error',
      title: 'Error',
      description: 'Marks the control aria-invalid and links the message with aria-describedby.',
    },
    {
      file: 'horizontal',
      title: 'Horizontal',
      description: 'Control first, text beside it. For checkboxes and switches.',
    },
  ],
  notes: [
    'Glyph controls call useFieldControl, so id, required, disabled and aria attributes flow from Field automatically.',
    'Use useFieldControl in your own controls to get the same wiring.',
  ],
})
