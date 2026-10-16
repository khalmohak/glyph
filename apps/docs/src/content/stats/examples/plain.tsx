import { Stats } from '@glyphui/blocks'

export default function Example() {
  return (
    <Stats
      title="Numbers our customers see"
      items={[
        { label: 'Invoices sent last month', value: '1.2M' },
        { label: 'Average days to get paid', value: '9', description: 'Down from 31' },
        { label: 'Uptime, trailing 12 months', value: '99.99%' },
        { label: 'Countries with local payments', value: '46' },
      ]}
    />
  )
}
