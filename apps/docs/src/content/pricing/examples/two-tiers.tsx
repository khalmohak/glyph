import { Pricing } from '@glyphui/blocks'

const euros = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export default function Example() {
  return (
    <Pricing
      formatPrice={(amount) => euros.format(amount)}
      periodLabels={{ monthly: 'pro Monat', yearly: 'pro Monat, jährlich' }}
      billingLabels={{ monthly: 'Monatlich', yearly: 'Jährlich' }}
      tiers={[
        {
          name: 'Team',
          price: { monthly: 12, yearly: 10 },
          features: ['Bis zu 10 Personen', 'Unbegrenzte Projekte'],
          cta: { label: 'Testen', onClick: () => {} },
        },
        {
          name: 'Business',
          price: { monthly: 24, yearly: 20 },
          features: ['Unbegrenzte Personen', 'SSO', 'Prioritäts-Support'],
          cta: { label: 'Testen', onClick: () => {} },
          highlighted: true,
        },
      ]}
    />
  )
}
