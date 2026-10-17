import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'DiffViewer',
  slug: 'diff-viewer',
  category: 'Viewers',
  status: 'beta',
  description:
    'Compare two versions of a text, unified or side by side, with changed words highlighted and unchanged lines folded.',
  entry: '@glyphui/viewers/diff',
  exports: ['DiffViewer', 'diffViewerStyles', 'computeDiff', 'toSplitRows'],
  source: 'diff/diff-viewer.tsx',
  propsOf: 'DiffViewer',
  examples: [
    { file: 'code', title: 'A code change', description: 'Unified view with folded context.' },
    {
      file: 'split',
      title: 'Side by side',
      description: 'Edits to a policy, compared in two columns.',
    },
  ],
  notes: [
    'Install the optional peer dependency first: npm install diff.',
    'Each changed line says whether it was added or removed to screen readers; the header announces the totals.',
    'Lines that were mostly rewritten are shown whole rather than word by word, which reads better.',
  ],
})
