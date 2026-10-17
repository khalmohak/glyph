import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Vite plugin',
  slug: 'vite-plugin',
  category: 'Patterns',
  status: 'beta',
  description:
    'Injects the color-mode script into index.html, so dark-mode visitors never see a light flash before React loads.',
  entry: '@glyphui/ui/vite',
  exports: ['glyphColorMode'],
  notes: [
    'Add it to vite.config.ts: plugins: [react(), tailwindcss(), glyphColorMode({ defaultMode: "system" })].',
    'Pass the same defaultMode and storageKey as GlyphProvider, so the script and the provider agree.',
    'The script runs before anything else in <head>, sets data-mode on <html>, and is under 400 bytes.',
    'With an SSR framework, render <ColorModeScript /> in the document head instead.',
  ],
})
