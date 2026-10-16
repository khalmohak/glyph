import { Testimonials } from '@glyphui/blocks'

export default function Example() {
  return (
    <Testimonials
      variant="featured"
      items={[
        {
          quote: 'Ledgerline replaced three tools and a part-time contractor. It just runs.',
          author: { name: 'Marcus Lee', title: 'Head of Finance, Hooli' },
        },
        {
          quote: 'Setup took an afternoon.',
          author: { name: 'Ines Duarte', title: 'Founder, Umbrella' },
        },
        {
          quote: 'The revenue reports are the best part.',
          author: { name: 'Kenji Watanabe', title: 'CFO, Vandelay' },
        },
      ]}
    />
  )
}
