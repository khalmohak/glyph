import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'NumberInput',
  slug: 'number-input',
  category: 'Forms',
  status: 'beta',
  description:
    'A number field with − / + steppers, arrow-key stepping, min/max clamping and locale formatting.',
  entry: '@glyphui/ui',
  exports: ['NumberInput', 'numberInputStyles'],
  source: 'components/number-input/number-input.tsx',
  propsOf: 'NumberInput',
  examples: [
    {
      file: 'basic',
      title: 'Quantity',
      description: 'Min, max and step. Shift + arrow steps by 10.',
    },
    {
      file: 'currency',
      title: 'Currency',
      description: 'Formatted while idle, raw while editing; the value stays a number.',
    },
  ],
  notes: [
    'The value is number | null (empty), never a string.',
    'Typed values outside min/max are clamped when the field loses focus.',
    'Home and End jump to min and max.',
  ],
})
