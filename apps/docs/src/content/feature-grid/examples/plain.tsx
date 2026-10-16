import { FeatureGrid } from '@glyphui/blocks'
import { Gauge, Globe, Plug, Shield } from 'lucide-react'

export default function Example() {
  return (
    <FeatureGrid
      variant="plain"
      columns={4}
      features={[
        {
          icon: <Gauge />,
          title: 'Fast',
          description: 'Edge-cached pages load in under 100 ms worldwide.',
        },
        {
          icon: <Shield />,
          title: 'Secure',
          description: 'Encryption at rest and in transit, by default.',
        },
        { icon: <Plug />, title: 'Connected', description: 'Webhooks and 40 native integrations.' },
        { icon: <Globe />, title: 'Global', description: 'Data residency in the EU, US and APAC.' },
      ]}
    />
  )
}
