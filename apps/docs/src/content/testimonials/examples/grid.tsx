import { Testimonials } from '@glyphui/blocks'

export default function Example() {
  return (
    <Testimonials
      title="Finance teams sleep better"
      items={[
        {
          quote: 'We closed the books two days faster the first month.',
          author: { name: 'Priya Raman', title: 'Controller, Northwind' },
        },
        {
          quote: 'Usage billing used to be a spreadsheet. Now it is a webhook.',
          author: { name: 'Tomás Ortega', title: 'CTO, Initech' },
        },
        {
          quote: 'Our late payments dropped by a third without a single awkward email.',
          author: { name: 'Hannah Becker', title: 'COO, Contoso' },
        },
      ]}
    />
  )
}
