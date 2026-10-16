import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Skeleton',
  slug: 'skeleton',
  category: 'Feedback',
  status: 'stable',
  description: 'A placeholder block shown while content loads. Size it with utility classes.',
  entry: '@glyphui/ui',
  exports: ['Skeleton', 'skeletonStyles'],
  source: 'components/skeleton/skeleton.tsx',
  propsOf: 'Skeleton',
  examples: [{ file: 'card', title: 'Loading a card' }],
  notes: [
    'Skeletons are aria-hidden; mark the loading region with aria-busy so screen readers know.',
  ],
})
