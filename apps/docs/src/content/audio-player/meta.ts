import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'AudioPlayer',
  slug: 'audio-player',
  category: 'Viewers',
  status: 'beta',
  description:
    'Audio with a waveform you can click to seek, plus play, time, volume and speed controls.',
  entry: '@glyphui/viewers/media',
  exports: ['AudioPlayer', 'audioPlayerStyles', 'Waveform', 'waveformStyles', 'computePeaks'],
  source: 'media/audio-player.tsx',
  propsOf: 'AudioPlayer',
  examples: [
    { file: 'basic', title: 'Voice note', description: 'The waveform is decoded in the browser.' },
    {
      file: 'waveform',
      title: 'Waveform alone',
      description: 'Precomputed peaks, e.g. from your server, with your own playback state.',
    },
  ],
  notes: [
    'No extra packages needed. Waveforms decode the file with the Web Audio API; pass peaks to skip that.',
    'The waveform is a slider: click or drag to seek, or use the arrow keys.',
  ],
})
