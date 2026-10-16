import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Card',
  slug: 'card',
  category: 'Layout',
  status: 'stable',
  description:
    'A surface that groups related content. Compose with CardHeader, CardTitle, CardBody and CardFooter.',
  entry: '@glyphui/ui',
  exports: [
    'Card',
    'CardHeader',
    'CardTitle',
    'CardDescription',
    'CardBody',
    'CardFooter',
    'cardStyles',
  ],
  source: 'components/card/card.tsx',
  propsOf: 'Card',
  examples: [
    { file: 'basic', title: 'Composed card' },
    {
      file: 'variants',
      title: 'Variants',
      description: 'Themes can change the default variant; the editorial preset uses outline.',
    },
    {
      file: 'interactive',
      title: 'Interactive',
      description: 'Lifts on hover. Use asChild to make the whole card a link.',
    },
  ],
})
