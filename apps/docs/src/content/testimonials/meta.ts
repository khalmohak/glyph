import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Testimonials',
  slug: 'testimonials',
  category: 'Blocks',
  status: 'beta',
  description: 'Customer quotes with names and roles, as a grid or with one featured quote on top.',
  entry: '@glyphui/blocks',
  exports: ['Testimonials'],
  propsOf: 'Testimonials',
  examples: [
    { file: 'grid', title: 'Grid' },
    { file: 'featured', title: 'Featured' },
  ],
})
