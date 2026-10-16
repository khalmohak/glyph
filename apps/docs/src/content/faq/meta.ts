import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Faq',
  slug: 'faq',
  category: 'Blocks',
  status: 'beta',
  description:
    'Frequently asked questions as an accordion, stacked or with the header beside the questions.',
  entry: '@glyphui/blocks',
  exports: ['Faq'],
  propsOf: 'Faq',
  examples: [
    { file: 'stacked', title: 'Stacked' },
    { file: 'split', title: 'Split layout' },
  ],
  notes: ['One answer is open at a time by default. Set multiple to allow several.'],
})
