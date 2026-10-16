import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'DescriptionList',
  slug: 'description-list',
  category: 'Data display',
  status: 'beta',
  description: 'Label–value pairs such as account details, order metadata or settings summaries.',
  entry: '@glyphui/ui',
  exports: ['DescriptionList', 'DescriptionItem', 'descriptionListStyles'],
  source: 'components/description-list/description-list.tsx',
  propsOf: 'DescriptionListProps',
  examples: [
    { file: 'inline', title: 'Inline with dividers' },
    {
      file: 'stacked',
      title: 'Stacked',
      description: 'Terms above details; works in narrow cards.',
    },
  ],
  notes: [
    'Renders a real <dl> with <dt>/<dd> pairs, so assistive tech reads each term with its value.',
  ],
})
