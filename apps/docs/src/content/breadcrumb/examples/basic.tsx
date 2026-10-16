import { Breadcrumb } from '@glyphui/ui'

export default function Example() {
  return (
    <Breadcrumb
      items={[
        { label: 'Acme', href: '#' },
        { label: 'Projects', href: '#' },
        { label: 'Glyph', href: '#' },
        { label: 'Settings' },
      ]}
    />
  )
}
