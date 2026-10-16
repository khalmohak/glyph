import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Table',
  slug: 'table',
  category: 'Data display',
  status: 'stable',
  description:
    'Semantic table primitives styled by the theme. For sorting, search and paging use DataTable.',
  entry: '@glyphui/ui',
  exports: [
    'Table',
    'TableHeader',
    'TableBody',
    'TableRow',
    'TableHead',
    'TableCell',
    'TableCaption',
    'tableStyles',
  ],
  source: 'components/table/table.tsx',
  propsOf: 'Table',
  examples: [
    { file: 'basic', title: 'Basic' },
    {
      file: 'numbers',
      title: 'Numeric columns',
      description: 'Figures are tabular by default, so digits line up.',
    },
  ],
  notes: ['The table scrolls horizontally inside its wrapper instead of widening the page.'],
})
