import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'RadarChart',
  slug: 'radar-chart',
  category: 'Data display',
  status: 'beta',
  description:
    'Compare a few items across several measures on a radar, or show progress toward goals as radial bars.',
  entry: '@glyphui/ui/chart',
  exports: ['RadarChart', 'RadialBarChart'],
  source: 'patterns/chart/radial.tsx',
  propsOf: 'RadarChart',
  examples: [
    { file: 'radar', title: 'Radar', description: 'Two plans scored on five measures.' },
    { file: 'radial-bar', title: 'Radial bars', description: 'Quarterly goals as rings.' },
  ],
  notes: [
    'Keep radars to two or three series and five to eight spokes; more becomes unreadable.',
    'RadialBarChart rings run to max, or to the largest value when max is not set.',
  ],
})
