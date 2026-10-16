import { FeatureGrid } from '@glyphui/blocks'
import { BarChart3, Lock, RefreshCw } from 'lucide-react'

export default function Example() {
  return (
    <FeatureGrid
      eyebrow="Why Ledgerline"
      title="Billing that keeps up with your product"
      description="Price by seats, usage or both. Change plans without touching code."
      features={[
        {
          icon: <RefreshCw />,
          title: 'Automatic retries',
          description: 'Failed payments retry on a smart schedule and email the right person.',
          href: '#retries',
        },
        {
          icon: <BarChart3 />,
          title: 'Revenue reports',
          description: 'MRR, churn and expansion, reconciled with your bank every night.',
          href: '#reports',
        },
        {
          icon: <Lock />,
          title: 'SOC 2 Type II',
          description: 'Audited controls, SSO and audit logs on every plan.',
          href: '#security',
        },
      ]}
    />
  )
}
