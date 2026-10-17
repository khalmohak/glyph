import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'DataTable',
  slug: 'data-table',
  category: 'Patterns',
  status: 'stable',
  description:
    'The table every app needs: search, filter chips, multi-column sorting, pagination, selection with bulk actions, column controls, row links and details, inline editing and CSV export, in client or server mode.',
  entry: '@glyphui/ui/data-table',
  exports: [
    'DataTable',
    'dataTableStyles',
    'filterChipStyles',
    'createColumnHelper',
    'useTableUrlState',
    'parseTableSearch',
    'writeTableSearch',
    'historyAdapter',
    'editableCell',
    'exportTableCsv',
    'toCsv',
  ],
  source: 'patterns/data-table/data-table.tsx',
  propsOf: 'DataTable',
  examples: [
    { file: 'basic', title: 'Sorting, search and selection' },
    {
      file: 'filters',
      title: 'Filter chips',
      description:
        'Declare meta.filter on a column: select, multi (with counts), range, date range or text. Shift-click headers to sort by more than one column.',
    },
    {
      file: 'server',
      title: 'Server mode',
      description:
        'mode="server" hands paging, sorting, search and filters to your API through onStateChange. Rows stay on screen while the next page loads.',
    },
    {
      file: 'url-state',
      title: 'State in the URL',
      description:
        'useTableUrlState keeps the view shareable and the back button working, with any router.',
    },
    {
      file: 'bulk-actions',
      title: 'Row actions and bulk actions',
      description: 'Select rows (or every matching row) and act on them from the floating bar.',
    },
    {
      file: 'columns',
      title: 'Column controls and density',
      description:
        'Hide, resize, pin and reorder columns; pinned columns stay put while the table scrolls sideways.',
    },
    { file: 'row-click', title: 'Clickable rows', description: 'Open details from a row.' },
    { file: 'expandable', title: 'Expandable rows' },
    {
      file: 'editing',
      title: 'Inline editing',
      description:
        'editableCell() edits in place. The new value shows at once and rolls back if saving fails: try more than 50 seats.',
    },
    { file: 'export', title: 'CSV export' },
    {
      file: 'mobile-cards',
      title: 'Cards on small screens',
      description: 'mobile="cards" turns each row into a card below 640px.',
    },
    { file: 'states', title: 'Loading and error' },
    {
      file: 'theming',
      title: 'Theme recipe',
      description: 'Set variant, density and slot classes for every DataTable from the theme file.',
    },
  ],
  notes: [
    'Columns are typed from your row type via createColumnHelper<T>(). Set meta: { align: "right" } on numeric columns.',
    'Requires @tanstack/react-table version 8 as a peer dependency (install @tanstack/react-table@8; version 9 is not supported yet).',
    'Every piece of state (page, sort, search, filters, visibility, sizes, pinning, order, selection, expanded rows, density) can be controlled through state and onStateChange, or left to the table. Pass getRowId so selections survive paging and data changes.',
    'Server mode: pass the current page as data, the total as rowCount (or hasNextPage for cursor APIs), and keep loading true while fetching. With TanStack Query, use placeholderData: keepPreviousData so the old page stays until the new one arrives.',
    'Select-all across pages sets allMatchingSelected in state; in server mode act on the query rather than the row ids.',
    'Clicks on buttons, links, checkboxes and menus inside a clickable row act on themselves. getRowHref renders the first column as a real link, so keyboard and middle-click work.',
    'CSV exports quote fields as RFC 4180 requires and prefix text starting with =, +, - or @ so spreadsheets don’t run it as a formula.',
    'For 10,000+ rows, pass virtualize from @glyphui/ui/data-table/virtual.',
  ],
})
