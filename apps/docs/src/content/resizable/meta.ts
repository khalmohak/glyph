import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Resizable',
  slug: 'resizable',
  category: 'Layout',
  status: 'beta',
  description: 'Panels separated by draggable dividers, for editors, inboxes and split views.',
  entry: '@glyphui/ui',
  exports: ['ResizablePanelGroup', 'ResizablePanel', 'ResizableHandle', 'resizableStyles'],
  source: 'components/resizable/resizable.tsx',
  propsOf: 'ResizableHandle',
  examples: [
    { file: 'horizontal', title: 'Sidebar and content' },
    {
      file: 'nested',
      title: 'Nested groups',
      description: 'A vertical group inside a horizontal one, like an editor with a terminal.',
    },
  ],
  notes: [
    'Built on react-resizable-panels. Sizes are percentages; set defaultSize, minSize and maxSize on each panel.',
    'Handles are focusable separators: use the arrow keys to resize, Home and End to collapse or expand.',
    'Pass autoSaveId to the group to remember sizes across visits.',
  ],
})
