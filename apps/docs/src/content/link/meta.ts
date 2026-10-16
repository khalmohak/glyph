import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Link',
  slug: 'link',
  category: 'Navigation',
  status: 'beta',
  description:
    'A text link with an animated underline. Internal links use your router; external ones open safely in a new tab.',
  entry: '@glyphui/ui',
  exports: ['Link', 'linkStyles'],
  source: 'components/link/link.tsx',
  propsOf: 'LinkProps',
  examples: [
    { file: 'tones', title: 'Tones and underline' },
    {
      file: 'external',
      title: 'External',
      description: 'Adds target, rel, an arrow and a screen-reader hint.',
    },
  ],
  notes: ['External links announce "(opens in a new tab)" to screen readers.'],
})
