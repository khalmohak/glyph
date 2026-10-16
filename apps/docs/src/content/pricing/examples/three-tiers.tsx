import { Pricing } from '@glyphui/blocks'

export default function Example() {
  return (
    <Pricing
      eyebrow="Pricing"
      title="Simple plans that grow with you"
      description="Start free. Upgrade when you send more than 50 invoices a month."
      defaultBilling="yearly"
      billingLabels={{ monthly: 'Monthly', yearly: 'Yearly · save 20%' }}
      tiers={[
        {
          name: 'Starter',
          description: 'For freelancers and side projects.',
          price: 0,
          features: ['50 invoices a month', 'Card and bank payments', 'Email support'],
          cta: { label: 'Start free', href: '#signup' },
        },
        {
          name: 'Growth',
          description: 'For teams billing on usage.',
          price: { monthly: 49, yearly: 39 },
          features: [
            'Unlimited invoices',
            'Usage-based pricing',
            'Dunning and retries',
            'Revenue reports',
          ],
          cta: { label: 'Start 14-day trial', href: '#trial' },
          highlighted: true,
          badge: 'Most popular',
        },
        {
          name: 'Enterprise',
          description: 'For finance teams with custom needs.',
          price: 'Custom',
          features: ['SSO and SCIM', 'Custom contracts', 'Dedicated support engineer'],
          cta: { label: 'Talk to sales', href: '#sales' },
        },
      ]}
    />
  )
}
