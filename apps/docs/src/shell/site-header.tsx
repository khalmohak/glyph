import { Badge, Button, Navbar, Tooltip } from '@glyphui/ui'
import { Github } from 'lucide-react'
import { Link } from 'react-router'
import { REPO_URL, sections } from '../lib/site'
import { version } from '../lib/version'
import { SearchCommand } from '../search'
import { Brand } from './brand'
import { ThemeControls } from './theme-controls'

/** The site header: Glyph's own Navbar, sticky, blurring once the page scrolls. */
export function SiteHeader() {
  return (
    <Navbar
      containerSize="full"
      className="[&>div]:px-4 sm:[&>div]:px-6"
      brand={
        <div className="flex items-center gap-3">
          <Brand />
          <Badge variant="outline" className="max-sm:hidden" asChild>
            <Link to="/changelog" aria-label={`Version ${version}, see the changelog`}>
              v{version}
            </Link>
          </Badge>
        </div>
      }
      links={sections.map((section) => ({ label: section.label, href: section.href }))}
      actions={
        <>
          <SearchCommand />
          <ThemeControls />
          <Tooltip content="GitHub">
            <Button variant="ghost" size="sm" iconOnly asChild>
              <a href={REPO_URL} aria-label="Glyph on GitHub">
                <Github className="size-4" />
              </a>
            </Button>
          </Tooltip>
        </>
      }
    />
  )
}
