import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@glyphui/ui'

const faq = [
  { q: 'Is Glyph free?', a: 'Yes. Both packages are MIT licensed and published on npm.' },
  {
    q: 'Does it work without Tailwind?',
    a: 'No. Glyph is built on Tailwind CSS v4 and ships a stylesheet that maps theme tokens to utilities.',
  },
  {
    q: 'Can I use my own fonts?',
    a: 'Set font.sans, font.display and font.mono in your theme file and load the fonts in your app.',
  },
]

export default function Example() {
  return (
    <Accordion type="single" collapsible defaultValue="item-0" className="max-w-xl">
      {faq.map((item, i) => (
        <AccordionItem key={item.q} value={`item-${i}`}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
