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
    'useIsActive',
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
    'Render GlyphProvider once at the root. Prevent the dark-mode flash with the Vite plugin (@glyphui/ui/vite), <ColorModeScript /> with SSR, or getColorModeScript() in <head>.',
    'Pass router to connect your router: links navigate client-side and navigation items mark the current page. useIsActive(href) exposes the same matching to your own components.',
    'theme.components is typed per component: a Button size that does not exist is a compile error.',
  ],
})
