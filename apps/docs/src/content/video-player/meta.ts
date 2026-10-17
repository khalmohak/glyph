import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'VideoPlayer',
  slug: 'video-player',
  category: 'Viewers',
  status: 'beta',
  description:
    'Video with themed controls: scrubbing with the buffered range, volume, speed, captions, picture in picture and fullscreen.',
  entry: '@glyphui/viewers/media',
  exports: ['VideoPlayer', 'videoPlayerStyles', 'formatTime'],
  source: 'media/video-player.tsx',
  propsOf: 'VideoPlayer',
  examples: [
    {
      file: 'captions',
      title: 'With captions',
      description: 'Turn captions on from the control bar or press C.',
    },
  ],
  notes: [
    'No extra packages needed: it’s the browser’s video element with Glyph controls.',
    'Keyboard: Space or K plays, ←/→ seek 5 seconds, J/L seek 10, ↑/↓ change volume, M mutes, C toggles captions, F goes fullscreen.',
    'The position and volume sliders are real sliders for assistive technology, with spoken times.',
  ],
})
