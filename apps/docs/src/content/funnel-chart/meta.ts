import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'FunnelChart',
  slug: 'funnel-chart',
  category: 'Data display',
  status: 'beta',
  description:
    'How many make it through each step of a flow, with the conversion from the previous step or from the start.',
  entry: '@glyphui/ui/chart',
  exports: ['FunnelChart'],
  source: 'patterns/chart/funnel.tsx',
  propsOf: 'FunnelChart',
  examples: [
    { file: 'signup', title: 'Signup funnel', description: 'Step-to-step conversion.' },
    {
      file: 'from-first',
      title: 'Share of the first step',
      description: 'conversion="first" measures every step against the top of the funnel.',
    },
  ],
  notes: [
    'Rows are stages in order. Bar widths are relative to the first stage.',
    'One measure, one color: later stages are tints of the same hue.',
  ],
})
