import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'ImageViewer',
  slug: 'image-viewer',
  category: 'Viewers',
  status: 'beta',
  description: 'An image you can zoom, pan, rotate and download, with keyboard and touch support.',
  entry: '@glyphui/viewers/media',
  exports: ['ImageViewer', 'imageViewerStyles'],
  source: 'media/image-viewer.tsx',
  propsOf: 'ImageViewer',
  examples: [
    { file: 'basic', title: 'Zoom and pan', description: 'Double-click to zoom in, drag to pan.' },
  ],
  notes: [
    'No extra packages needed.',
    'Zoom with the buttons, ⌘ or Ctrl + scroll, a trackpad pinch or two fingers. Plain scrolling still scrolls the page.',
    'Keyboard: + and − zoom, 0 fits, 1 shows actual size, R rotates, arrow keys pan.',
  ],
})
