import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'ScrollArea',
  slug: 'scroll-area',
  category: 'Layout',
  status: 'beta',
  description:
    'A scrollable region with slim scrollbars colored by the theme, consistent across browsers.',
  entry: '@glyphui/ui',
  exports: ['ScrollArea', 'scrollAreaStyles'],
  source: 'components/scroll-area/scroll-area.tsx',
  propsOf: 'ScrollAreaProps',
  radix: 'https://www.radix-ui.com/primitives/docs/components/scroll-area',
  examples: [
    { file: 'vertical', title: 'Vertical list' },
    { file: 'horizontal', title: 'Horizontal' },
  ],
  notes: ['Give the root a height (or width for horizontal) with className, e.g. h-72.'],
})
