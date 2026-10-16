import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Timeline',
  slug: 'timeline',
  category: 'Data display',
  status: 'beta',
  description:
    'A vertical list of events in order, for activity feeds, changelogs and order tracking.',
  entry: '@glyphui/ui',
  exports: ['Timeline', 'TimelineItem', 'timelineStyles'],
  source: 'components/timeline/timeline.tsx',
  propsOf: 'TimelineItem',
  examples: [
    { file: 'activity', title: 'Activity feed', description: 'Data-driven with the items prop.' },
    {
      file: 'order-tracking',
      title: 'Order tracking',
      description: 'Composed TimelineItem children with tones and icons.',
    },
  ],
  notes: [
    'Renders an ordered list, so screen readers announce the number of events.',
    'Pass dateTime alongside time so the <time> element carries a machine-readable date.',
  ],
})
