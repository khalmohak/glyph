import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Collapsible',
  slug: 'collapsible',
  category: 'Data display',
  status: 'beta',
  description: 'Shows and hides one region, such as advanced options or the rest of a long list.',
  entry: '@glyphui/ui',
  exports: ['Collapsible', 'CollapsibleTrigger', 'CollapsibleContent', 'collapsibleStyles'],
  source: 'components/collapsible/collapsible.tsx',
  propsOf: 'Collapsible',
  radix: 'https://www.radix-ui.com/primitives/docs/components/collapsible',
  examples: [
    { file: 'advanced', title: 'Advanced options' },
    {
      file: 'list',
      title: 'Show more',
      description: 'Reveal the rest of a list without leaving the page.',
    },
  ],
  notes: [
    'The content animates its height open and closed and stays mounted until the closing animation ends.',
    'For several expandable sections where one opens at a time, use Accordion.',
  ],
})
