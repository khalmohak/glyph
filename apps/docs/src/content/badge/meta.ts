import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Badge',
  slug: 'badge',
  category: 'Data display',
  status: 'stable',
  description: 'A short status or label. Six tones, three variants, and an optional status dot.',
  entry: '@glyphui/ui',
  exports: ['Badge', 'badgeStyles'],
  source: 'components/badge/badge.tsx',
  propsOf: 'Badge',
  examples: [
    { file: 'tones', title: 'Tones' },
    {
      file: 'variants',
      title: 'Variants',
      description: 'Soft is the default; solid for emphasis, outline for quiet labels.',
    },
    { file: 'status', title: 'Status with dot' },
  ],
  notes: [
    'Tinted text is mixed toward the foreground color so it stays readable in light and dark mode.',
    'Color alone should not carry meaning; keep the label text descriptive.',
  ],
})
