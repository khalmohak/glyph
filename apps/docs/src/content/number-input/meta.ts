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
  a11y: {
    keyboard: [
      { keys: 'Arrow Up or Arrow Down', action: 'Steps the value up or down.' },
      { keys: 'Shift + Arrow Up or Shift + Arrow Down', action: 'Steps by ten.' },
      { keys: 'Home or End', action: 'Jumps to min or max, when they are set.' },
      { keys: 'Enter', action: 'Commits what you typed.' },
    ],
    notes: [
      'The input has role="spinbutton" with aria-valuenow, aria-valuemin and aria-valuemax; the stepper buttons are labelled Decrease and Increase.',
      'Tabbing in selects the whole value, so typing replaces it.',
    ],
  },
})
