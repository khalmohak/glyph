import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Checkbox',
  slug: 'checkbox',
  category: 'Forms',
  status: 'stable',
  description: 'A checkbox with checked, unchecked and indeterminate states.',
  entry: '@glyphui/ui',
  exports: ['Checkbox', 'checkboxStyles'],
  source: 'components/checkbox/checkbox.tsx',
  propsOf: 'Checkbox',
  radix: 'https://www.radix-ui.com/primitives/docs/components/checkbox',
  examples: [
    { file: 'basic', title: 'With a label' },
    {
      file: 'indeterminate',
      title: 'Select all',
      description: 'Indeterminate when some, not all, items are checked.',
    },
  ],
})
