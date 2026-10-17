import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Accordion',
  slug: 'accordion',
  category: 'Data display',
  status: 'beta',
  description:
    'Stacked sections that expand one at a time or independently. Good for FAQs and dense settings.',
  entry: '@glyphui/ui',
  exports: [
    'Accordion',
    'AccordionItem',
    'AccordionTrigger',
    'AccordionContent',
    'accordionStyles',
  ],
  source: 'components/accordion/accordion.tsx',
  propsOf: 'AccordionProps',
  radix: 'https://www.radix-ui.com/primitives/docs/components/accordion',
  examples: [
    {
      file: 'faq',
      title: 'FAQ',
      description: 'type="single" collapsible: one section open at a time.',
    },
    {
      file: 'separated',
      title: 'Separated cards',
      description: 'variant="separated" with type="multiple".',
    },
  ],
  notes: [
    'Triggers are buttons inside headings, with aria-expanded and arrow-key navigation between them.',
    'Opening fades the content in; it respects reduced-motion settings.',
  ],
  a11y: {
    keyboard: [
      { keys: 'Enter or Space', action: 'Expands or collapses the focused section.' },
      { keys: 'Arrow Down or Arrow Up', action: 'Moves between section headers.' },
      { keys: 'Home or End', action: 'Moves to the first or last header.' },
    ],
    notes: [
      'Each header is a button inside a heading, with aria-expanded and aria-controls pointing at its panel.',
    ],
  },
})
