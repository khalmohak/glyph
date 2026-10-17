import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Virtual rows',
  slug: 'data-table-virtual',
  category: 'Patterns',
  status: 'beta',
  description:
    'Virtualization for DataTable: only the rows in view are rendered, so tables with tens of thousands of rows scroll smoothly.',
  entry: '@glyphui/ui/data-table/virtual',
  exports: ['virtualRows'],
  source: 'patterns/data-table/virtual.ts',
  examples: [
    {
      file: 'ten-thousand',
      title: '10,000 rows',
      description: 'Search, sort and select still work across every row.',
    },
  ],
  notes: [
    'Install the optional peer dependency first: npm install @tanstack/react-virtual.',
    'Create the virtualizer once (outside your component or with useMemo) and pass it to DataTable’s virtualize prop with pageSize={false}.',
    'The table scrolls inside a fixed height (default 480px) with its header pinned; screen readers get the full row count from aria-rowcount and each row’s position from aria-rowindex.',
    'Expandable rows are not virtualized; use pagination for tables with row details.',
  ],
})
