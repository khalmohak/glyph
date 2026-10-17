import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'DataTable',
  slug: 'data-table',
  category: 'Patterns',
  status: 'stable',
  description:
    'A table with sorting, search, pagination and row selection, plus loading, empty, no-results and error states.',
  entry: '@glyphui/ui/data-table',
  exports: ['DataTable', 'dataTableStyles', 'createColumnHelper'],
  source: 'patterns/data-table/data-table.tsx',
  propsOf: 'DataTable',
  examples: [
    { file: 'basic', title: 'Sorting, search and selection' },
    { file: 'states', title: 'Loading and error' },
  ],
  notes: [
    'Columns are typed from your row type via createColumnHelper<T>().',
    'Set meta: { align: "right" } on numeric columns.',
    'Requires @tanstack/react-table version 8 as a peer dependency (install @tanstack/react-table@8; version 9 is not supported yet).',
  ],
})
