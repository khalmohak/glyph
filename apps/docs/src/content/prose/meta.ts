import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Prose',
  slug: 'prose',
  category: 'Typography',
  status: 'beta',
  description:
    'Styles raw HTML or MDX for long-form reading: headings, lists, links, quotes, code, tables and images.',
  entry: '@glyphui/ui',
  exports: ['Prose', 'proseStyles'],
  source: 'components/prose/prose.tsx',
  propsOf: 'ProseProps',
  examples: [
    {
      file: 'article',
      title: 'Article',
      description: 'Switch to the editorial theme to see it at its best.',
    },
  ],
  notes: [
    'Wrap rendered Markdown, MDX or CMS HTML. Every style comes from theme tokens.',
    'Width defaults to about 65 characters for comfortable reading; pass fullWidth to remove the limit.',
  ],
})
