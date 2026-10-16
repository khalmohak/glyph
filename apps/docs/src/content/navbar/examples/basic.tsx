import { Button, Navbar } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Navbar
        sticky={false}
        blurOnScroll={false}
        brand={<span className="font-display">acme</span>}
        links={[
          { label: 'Product', href: '#product', active: true },
          { label: 'Pricing', href: '#pricing' },
          { label: 'Docs', href: '#docs' },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
            <Button size="sm">Get started</Button>
          </>
        }
      />
    </div>
  )
}
