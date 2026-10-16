import { Faq } from '@glyphui/blocks'
import { Link } from '@glyphui/ui'

export default function Example() {
  return (
    <Faq
      layout="split"
      eyebrow="Support"
      title="Before you start"
      description={
        <>
          Can’t find what you need? <Link href="#contact">Talk to us</Link>.
        </>
      }
      multiple
      items={[
        {
          question: 'Is there a free trial?',
          answer: 'Growth comes with a 14-day trial. Starter is free forever.',
        },
        {
          question: 'Can I cancel anytime?',
          answer: 'Yes. You keep access until the end of the billing period.',
        },
        {
          question: 'Where is my data stored?',
          answer: 'In the EU or US, your choice, on SOC 2 audited infrastructure.',
        },
      ]}
    />
  )
}
