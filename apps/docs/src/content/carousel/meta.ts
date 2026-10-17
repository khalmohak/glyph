import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Carousel',
  slug: 'carousel',
  category: 'Data display',
  status: 'beta',
  description: 'Swipeable, keyboard-accessible slides for testimonials, media and onboarding.',
  entry: '@glyphui/ui',
  exports: [
    'Carousel',
    'CarouselContent',
    'CarouselItem',
    'CarouselPrevious',
    'CarouselNext',
    'CarouselDots',
    'carouselStyles',
  ],
  source: 'components/carousel/carousel.tsx',
  propsOf: 'Carousel',
  examples: [
    { file: 'testimonials', title: 'Testimonials', description: 'One slide at a time, with dots.' },
    {
      file: 'multiple',
      title: 'Several per view',
      description: 'Size items with basis classes; align and loop through opts.',
    },
  ],
  notes: [
    'Built on Embla. Swipe on touch, drag with a mouse, or use the arrow keys while focus is inside.',
    'Uses the WAI-ARIA carousel pattern: the region is labelled and each slide announces “n of total”.',
    'Pass setApi to build custom controls on the Embla API.',
  ],
  a11y: {
    keyboard: [
      {
        keys: 'Arrow Left or Arrow Right',
        action: 'Previous or next slide (Arrow Up or Down when vertical).',
      },
      { keys: 'Tab', action: 'Reaches the Previous and Next buttons.' },
    ],
    notes: [
      'Arrow keys are left alone inside inputs and other editable elements in a slide.',
      'Slides are grouped and labelled "N of M" for screen readers.',
    ],
  },
})
