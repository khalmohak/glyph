import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Label',
  slug: 'label',
  category: 'Forms',
  status: 'stable',
  description: 'An accessible label for a form control. Field renders one for you.',
  entry: '@glyphui/ui',
  exports: ['Label', 'labelStyles'],
  source: 'components/label/label.tsx',
  propsOf: 'Label',
  radix: 'https://www.radix-ui.com/primitives/docs/components/label',
  examples: [{ file: 'basic', title: 'With a control' }],
  notes: ['Prefer Field, which also wires descriptions, errors and aria attributes.'],
})
