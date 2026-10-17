import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'CodeViewer',
  slug: 'code-viewer',
  category: 'Viewers',
  status: 'beta',
  description:
    'Source code with syntax colors from your theme, line numbers, highlighted lines, a wrap toggle and copy.',
  entry: '@glyphui/viewers/code',
  exports: [
    'CodeViewer',
    'codeViewerStyles',
    'parseLineRanges',
    'highlightCode',
    'languageFromFileName',
    'resolveLanguage',
  ],
  source: 'code/code-viewer.tsx',
  propsOf: 'CodeViewer',
  examples: [
    {
      file: 'file',
      title: 'A source file',
      description: 'The language comes from the file name; lines 14–16 are highlighted.',
    },
    { file: 'inline', title: 'A snippet', description: 'Pass code as a string, with wrapping on.' },
    {
      file: 'bare',
      title: 'Without the header',
      description: 'Just the code, for embedding in your own layout.',
    },
  ],
  notes: [
    'Install the optional peer dependency first: npm install shiki.',
    'Colors are CSS variables (--shiki-token-*) mapped to your theme in @glyphui/viewers/styles.css, so code follows light and dark mode and every preset.',
    'Grammars load on first use, one language at a time, with Shiki’s JavaScript engine (no WebAssembly).',
  ],
})
