import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Code',
  slug: 'code',
  category: 'Typography',
  status: 'beta',
  description:
    'Inline code for running text, and CodeBlock for snippets with a file name and a copy button.',
  entry: '@glyphui/ui',
  exports: ['Code', 'CodeBlock', 'codeStyles', 'codeBlockStyles'],
  source: 'components/code/code.tsx',
  propsOf: 'CodeBlockProps',
  examples: [
    { file: 'inline', title: 'Inline' },
    { file: 'block', title: 'Code block' },
  ],
  notes: [
    'CodeBlock does not highlight syntax, so it adds no dependency. Bring your own highlighter if you need one.',
    'If the clipboard is blocked, the copy button does nothing and the code stays selectable.',
  ],
})
