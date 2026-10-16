import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Stats',
  slug: 'stats',
  category: 'Blocks',
  status: 'beta',
  description: 'Headline numbers that back up a claim: customers, uptime, money saved.',
  entry: '@glyphui/blocks',
  exports: ['Stats'],
  propsOf: 'Stats',
  examples: [
    { file: 'plain', title: 'Plain' },
    { file: 'cards', title: 'Cards, centered' },
  ],
  notes: ['Values render as a description list, so each number is read with its label.'],
})
