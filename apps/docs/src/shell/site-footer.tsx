import { SiteFooter as Footer } from '@glyphui/blocks'
import { Button } from '@glyphui/ui'
import { Github } from 'lucide-react'
import { guides, LIVE_URL, NPM_URL, REPO_URL } from '../lib/site'
import { Brand } from './brand'

/** The footer on full-width pages, built from the SiteFooter block. */
export function SiteFooter() {
  return (
    <Footer
      brand={<Brand />}
      tagline="React components on Tailwind CSS v4 that take their whole look from one typed theme file."
      columns={[
        {
          title: 'Library',
          links: [
            { label: 'Components', href: '/components' },
            { label: 'Blocks', href: '/blocks' },
            { label: 'Themes', href: '/themes' },
            { label: 'Templates', href: '/templates' },
          ],
        },
        {
          title: 'Guides',
          links: guides.slice(0, 5).map((guide) => ({
            label: guide.title,
            href: `/docs/${guide.slug}`,
          })),
        },
        {
          title: 'Demos',
          links: [
            { label: 'Ledgerline SaaS', href: `${LIVE_URL}/demo/` },
            { label: 'Auth example', href: `${LIVE_URL}/auth/` },
          ],
        },
        {
          title: 'Project',
          links: [
            { label: 'GitHub', href: REPO_URL },
            { label: 'npm', href: NPM_URL },
            { label: 'Changelog', href: '/changelog' },
            { label: 'License (MIT)', href: `${REPO_URL}/blob/main/LICENSE` },
          ],
        },
      ]}
      copyright="MIT licensed. Built with Glyph."
      socials={
        <Button variant="ghost" size="sm" iconOnly asChild>
          <a href={REPO_URL} aria-label="Glyph on GitHub">
            <Github className="size-4" />
          </a>
        </Button>
      }
    />
  )
}
