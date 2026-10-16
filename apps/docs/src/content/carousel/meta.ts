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
})
