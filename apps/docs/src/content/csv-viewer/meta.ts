import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'CsvViewer',
  slug: 'csv-viewer',
  category: 'Viewers',
  status: 'beta',
  description:
    'Open a CSV as a table: typed columns, search, sort, filters from the data, column controls and export of the filtered rows.',
  entry: '@glyphui/viewers/csv',
  exports: ['CsvViewer', 'csvViewerStyles', 'parseCsv', 'buildTable', 'inferColumnType'],
  source: 'csv/csv-viewer.tsx',
  propsOf: 'CsvViewer',
  examples: [
    {
      file: 'basic',
      title: 'Customers',
      description: 'Numbers, dates and yes/no columns are detected, each with a matching filter.',
    },
    {
      file: 'large',
      title: '50,000 rows',
      description: 'Big files parse in a worker with progress and render only the rows in view.',
    },
    {
      file: 'paste',
      title: 'Pasted text',
      description: 'Semicolon-separated data, detected automatically.',
    },
  ],
  notes: [
    'Install the optional peer dependencies first: npm install papaparse @tanstack/react-table @tanstack/react-virtual.',
    'Quotes, escaped quotes, line breaks inside quoted cells and a byte-order mark are all handled. Rows that can’t be read cleanly are listed with their row numbers.',
    'A column is typed when 95% of its values agree, so one “n/a” doesn’t turn numbers into text. Columns with a few repeating values get a multi-select filter.',
    'The header row is detected; people can turn it off, and change the delimiter, from the toolbar.',
  ],
})
