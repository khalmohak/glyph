import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Tooltip',
  slug: 'tooltip',
  category: 'Overlays',
  status: 'stable',
  description: 'A short hint shown on hover or keyboard focus.',
  entry: '@glyphui/ui',
  exports: ['Tooltip', 'tooltipStyles'],
  source: 'components/tooltip/tooltip.tsx',
  propsOf: 'Tooltip',
  radix: 'https://www.radix-ui.com/primitives/docs/components/tooltip',
  examples: [
    { file: 'icon-button', title: 'On an icon button' },
    { file: 'sides', title: 'Placement' },
  ],
  notes: [
    'The child must be focusable (a button or link) so keyboard users see the hint too.',
    'Never put essential information only in a tooltip; touch screens cannot hover.',
  ],
})
