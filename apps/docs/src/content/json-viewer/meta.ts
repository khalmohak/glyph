import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'JsonViewer',
  slug: 'json-viewer',
  category: 'Viewers',
  status: 'beta',
  description:
    'Explore JSON as a collapsible tree: search keys and values, expand to any depth, copy a value or its JSONPath, or read the raw text.',
  entry: '@glyphui/viewers/json',
  exports: ['JsonViewer', 'jsonViewerStyles', 'indexJson', 'parseJson', 'searchJson', 'childPath'],
  source: 'json/json-viewer.tsx',
  propsOf: 'JsonViewer',
  examples: [
    {
      file: 'basic',
      title: 'A JSON file',
      description: 'Search for “invoice”, then step through the matches.',
    },
    {
      file: 'data',
      title: 'A value from your app',
      description: 'Pass parsed data directly, here an API response.',
    },
    {
      file: 'invalid',
      title: 'Invalid JSON',
      description: 'Syntax errors point at the line and column.',
    },
  ],
  notes: [
    'No extra packages needed.',
    'The tree is keyboard navigable: arrow keys move and expand, Home and End jump, Enter toggles.',
    'Only rows in view are rendered, so documents with tens of thousands of nodes stay responsive.',
    'Select a row to see its JSONPath in the footer, with buttons to copy the path or the value.',
  ],
})
