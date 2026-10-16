import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Theming',
  slug: 'theme',
  category: 'Patterns',
  status: 'stable',
  description:
    'One typed theme file controls color, type, shape, depth, motion and component defaults. Providers apply it and handle color mode.',
  entry: '@glyphui/ui',
  exports: [
    'GlyphProvider',
    'ThemeScope',
    'ColorModeProvider',
    'ColorModeScript',
    'getColorModeScript',
    'useColorMode',
    'useGlyph',
    'useLinkComponent',
    'defineTheme',
    'themeToCss',
    'tokenVar',
    'presets',
    'glyph',
    'brutalist',
    'editorial',
    'playful',
  ],
  source: 'provider/glyph-provider.tsx',
  propsOf: 'GlyphProvider',
  examples: [
    {
      file: 'theme-scope',
      title: 'Presets side by side',
      description: 'ThemeScope renders a subtree with a different theme.',
    },
    { file: 'color-mode', title: 'Color mode' },
    { file: 'custom-theme', title: 'Extending a preset' },
  ],
  notes: [
    'Render GlyphProvider once at the root. Put getColorModeScript() in <head> so dark-mode visitors never see a light flash.',
    'theme.components is typed per component: a Button size that does not exist is a compile error.',
  ],
})
