import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'VisuallyHidden',
  slug: 'visually-hidden',
  category: 'Layout',
  status: 'beta',
  description:
    'Hides content visually while keeping it available to screen readers, such as labels for icon-only controls.',
  entry: '@glyphui/ui',
  exports: ['VisuallyHidden'],
  source: 'components/visually-hidden/visually-hidden.tsx',
  propsOf: 'VisuallyHidden',
  radix: 'https://www.radix-ui.com/primitives/docs/utilities/visually-hidden',
  examples: [{ file: 'icon-label', title: 'Labelling icons' }],
  notes: [
    'Prefer aria-label on the control itself when it is a single element; use VisuallyHidden when the text is part of richer content.',
  ],
})
