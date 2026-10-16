import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Utilities',
  slug: 'utilities',
  category: 'Patterns',
  status: 'stable',
  description:
    'The helpers Glyph components are built with, for building your own themed components.',
  entry: '@glyphui/ui',
  exports: [
    'cn',
    'tv',
    'useComponentConfig',
    'useControllableState',
    'useMediaQuery',
    'useScrolled',
  ],
  examples: [
    {
      file: 'cn',
      title: 'cn',
      description: 'Joins classes and resolves Tailwind conflicts, including Glyph type tokens.',
    },
    { file: 'hooks', title: 'Hooks' },
  ],
  notes: [
    'tv is tailwind-variants preconfigured with Glyph merge rules; use it for your own component styles.',
    "useComponentConfig applies a theme's per-component defaults and classes to your component.",
  ],
})
