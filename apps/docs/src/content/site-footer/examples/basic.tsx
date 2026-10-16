import { SiteFooter } from '@glyphui/blocks'
import { Button } from '@glyphui/ui'
import { Github, Linkedin } from 'lucide-react'

export default function Example() {
  return (
    <SiteFooter
      brand={<span className="font-display text-h4">Ledgerline</span>}
      tagline="Billing and invoicing for software companies."
      columns={[
        {
          title: 'Product',
          links: [
            { label: 'Pricing', href: '#pricing' },
            { label: 'Changelog', href: '#changelog' },
            { label: 'Status', href: '#status' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About', href: '#about' },
            { label: 'Careers', href: '#careers' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { label: 'Docs', href: '#docs' },
            { label: 'API reference', href: '#api' },
          ],
        },
        {
          title: 'Legal',
          links: [
            { label: 'Privacy', href: '#privacy' },
            { label: 'Terms', href: '#terms' },
          ],
        },
      ]}
      copyright="© 2026 Ledgerline, Inc."
      socials={
        <>
          <Button variant="ghost" size="sm" iconOnly asChild>
            <a href="#github" aria-label="GitHub">
              <Github className="size-4" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" iconOnly asChild>
            <a href="#linkedin" aria-label="LinkedIn">
              <Linkedin className="size-4" />
            </a>
          </Button>
        </>
      }
    />
  )
}
