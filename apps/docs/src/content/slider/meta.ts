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
  a11y: {
    keyboard: [
      { keys: 'Arrow Right or Arrow Up', action: 'Increases the value by one step.' },
      { keys: 'Arrow Left or Arrow Down', action: 'Decreases the value by one step.' },
      { keys: 'Page Up or Page Down', action: 'Changes the value by a larger step.' },
      { keys: 'Shift + Arrow keys', action: 'Changes the value by a larger step.' },
      { keys: 'Home or End', action: 'Jumps to the minimum or maximum.' },
    ],
    notes: [
      'Each thumb has role="slider" with aria-valuemin, aria-valuemax and aria-valuenow.',
      'Thumbs are labelled by the Field label (aria-labelledby); range sliders take thumbLabels.',
    ],
  },
})
