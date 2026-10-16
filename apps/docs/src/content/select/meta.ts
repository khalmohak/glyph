import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Select',
  slug: 'select',
  category: 'Forms',
  status: 'stable',
  description: 'A dropdown for choosing one option from a short list. The value type is generic.',
  entry: '@glyphui/ui',
  exports: ['Select', 'SelectItem', 'selectStyles'],
  source: 'components/select/select.tsx',
  propsOf: 'Select',
  radix: 'https://www.radix-ui.com/primitives/docs/components/select',
  examples: [
    { file: 'basic', title: 'In a field' },
    {
      file: 'typed',
      title: 'Typed values',
      description: 'Select<Plan> only accepts and emits Plan values.',
    },
  ],
  notes: ['For long lists or search, use Combobox.'],
})
