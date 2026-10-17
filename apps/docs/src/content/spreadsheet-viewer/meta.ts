import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'SpreadsheetViewer',
  slug: 'spreadsheet-viewer',
  category: 'Viewers',
  status: 'beta',
  description:
    'Open an Excel workbook (.xlsx) as tabs of tables, with the cells’ numbers, dates and booleans kept as types.',
  entry: '@glyphui/viewers/spreadsheet',
  exports: ['SpreadsheetViewer', 'spreadsheetViewerStyles'],
  source: 'spreadsheet/spreadsheet-viewer.tsx',
  propsOf: 'SpreadsheetViewer',
  examples: [
    {
      file: 'basic',
      title: 'Two sheets',
      description: 'Switch sheets with the tabs; each has its own filters.',
    },
  ],
  notes: [
    'Install the optional peer dependencies first: npm install read-excel-file @tanstack/react-table @tanstack/react-virtual.',
    'It reads .xlsx files (Office Open XML). The old binary .xls format isn’t supported.',
    'Merged cells show their value in the first cell and leave the rest blank.',
    'Files over 20 MB ask before opening, since the whole workbook is read in memory; change it with maxBytes.',
  ],
})
