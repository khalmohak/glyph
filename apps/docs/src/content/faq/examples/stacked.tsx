import { Faq } from '@glyphui/blocks'

export default function Example() {
  return (
    <Faq
      title="Questions, answered"
      items={[
        {
          question: 'Can I import my existing customers?',
          answer:
            'Yes. Upload a CSV or connect Stripe and we import customers, plans and payment methods.',
        },
        {
          question: 'Do you charge per invoice?',
          answer: 'No. Plans are flat monthly prices; Starter includes 50 invoices a month.',
        },
        {
          question: 'Which currencies do you support?',
          answer: '135 currencies, with local payment methods in 46 countries.',
        },
      ]}
    />
  )
}
