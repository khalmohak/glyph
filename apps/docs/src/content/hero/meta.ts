import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Hero',
  slug: 'hero',
  category: 'Blocks',
  status: 'beta',
  description:
    'The opening section of a page: headline, supporting text, actions, and optional media beside or below.',
  entry: '@glyphui/blocks',
  exports: ['Hero', 'heroStyles'],
  propsOf: 'Hero',
  examples: [
    {
      file: 'centered',
      title: 'Centered',
      description: 'The default: everything centered over a soft glow from the primary color.',
    },
    {
      file: 'split',
      title: 'Split with media',
      description: 'Text on the left, media on the right on large screens.',
    },
  ],
  notes: [
    'The title is an h1 by default. Set headingLevel when the hero is not the first heading on the page.',
    'The section is labeled by its title, so screen readers can jump to it.',
  ],
})
