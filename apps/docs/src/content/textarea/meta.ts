import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Textarea',
  slug: 'textarea',
  category: 'Forms',
  status: 'stable',
  description: 'A multi-line text field that grows with its content.',
  entry: '@glyphui/ui',
  exports: ['Textarea', 'textareaStyles'],
  source: 'components/textarea/textarea.tsx',
  propsOf: 'Textarea',
  examples: [{ file: 'with-field', title: 'In a field' }],
})
