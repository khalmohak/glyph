import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'TreeView',
  slug: 'tree-view',
  category: 'Data display',
  status: 'beta',
  description:
    'A nested, expandable list for file trees and hierarchies, with full keyboard navigation.',
  entry: '@glyphui/ui',
  exports: ['TreeView', 'treeViewStyles'],
  source: 'components/tree-view/tree-view.tsx',
  propsOf: 'TreeView',
  examples: [
    { file: 'file-tree', title: 'File tree' },
    {
      file: 'controlled',
      title: 'Controlled selection',
      description: 'Drive expanded and selected from your own state.',
    },
  ],
  notes: [
    'Follows the WAI-ARIA tree pattern: one tab stop, arrow keys to move, Right and Left to expand and collapse, Home and End to jump, a letter to find the next match.',
    'Enter or Space selects. Clicking a parent also expands or collapses it.',
    'Give the tree an aria-label that says what it contains.',
  ],
  a11y: {
    keyboard: [
      { keys: 'Arrow Down or Arrow Up', action: 'Moves to the next or previous visible item.' },
      { keys: 'Arrow Right', action: 'Expands a closed item, or moves to its first child.' },
      { keys: 'Arrow Left', action: 'Collapses an open item, or moves to its parent.' },
      { keys: 'Home or End', action: 'Moves to the first or last visible item.' },
      { keys: 'Enter or Space', action: 'Selects the focused item.' },
      {
        keys: 'Letter keys',
        action: 'Typeahead: moves to the next item starting with that letter.',
      },
    ],
    notes: [
      'Uses role="tree" and treeitem with aria-expanded, aria-level and aria-selected; one item is a Tab stop.',
    ],
  },
})
