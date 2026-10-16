import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Input',
  slug: 'input',
  category: 'Forms',
  status: 'stable',
  description: 'A single-line text field with optional prefix and suffix content.',
  entry: '@glyphui/ui',
  exports: ['Input', 'inputStyles', 'fieldControl'],
  source: 'components/input/input.tsx',
  propsOf: 'Input',
  examples: [
    { file: 'basic', title: 'Basic' },
    { file: 'adornments', title: 'Prefix and suffix' },
    { file: 'sizes', title: 'Sizes' },
  ],
  notes: [
    'className styles the outer frame; use inputClassName for the <input> element itself.',
    'fieldControl is the shared class list used by Input, Textarea and the Select trigger.',
  ],
})
