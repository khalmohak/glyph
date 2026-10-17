import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'MarkdownViewer',
  slug: 'markdown-viewer',
  category: 'Viewers',
  status: 'beta',
  description:
    'Render Markdown with your theme’s typography: GitHub tables, task lists, highlighted code blocks and heading links.',
  entry: '@glyphui/viewers/markdown',
  exports: ['MarkdownViewer', 'markdownViewerStyles', 'slugify'],
  source: 'markdown/markdown-viewer.tsx',
  propsOf: 'MarkdownViewer',
  examples: [{ file: 'readme', title: 'A README', description: 'Hover a heading for its link.' }],
  notes: [
    'Install the optional peer dependencies first: npm install react-markdown remark-gfm shiki.',
    'Safe by default: raw HTML in the Markdown shows as text. If you need HTML, add rehype-raw to rehypePlugins and rehype-sanitize after it.',
    'Code blocks render with CodeViewer, so they follow your theme too.',
  ],
})
