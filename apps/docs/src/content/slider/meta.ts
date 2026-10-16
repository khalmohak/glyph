import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Slider',
  slug: 'slider',
  category: 'Forms',
  status: 'beta',
  description: 'Choose a number, or a range with two thumbs, by dragging or with the arrow keys.',
  entry: '@glyphui/ui',
  exports: ['Slider', 'sliderStyles'],
  source: 'components/slider/slider.tsx',
  propsOf: 'SliderProps',
  radix: 'https://www.radix-ui.com/primitives/docs/components/slider',
  examples: [
    {
      file: 'basic',
      title: 'Single value',
      description: 'showValue displays the value above the thumb.',
    },
    {
      file: 'range',
      title: 'Range',
      description: 'Pass a [min, max] tuple; onValueChange returns a tuple.',
    },
  ],
  notes: [
    'Use onValueCommit for expensive work such as network requests; it fires once when the thumb is released.',
    'Range thumbs are named "Minimum" and "Maximum" by default; change them with thumbLabels.',
  ],
})
