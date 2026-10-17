import { Container, cn, Text, useLinkComponent } from '@glyphui/ui'
import { type ComponentProps, type ReactNode, useId } from 'react'
import { useBlocksStylesCheck } from '../internal/styles-check'

export interface FooterLink {
  label: ReactNode
  href: string
}

export interface FooterColumn {
  title: string
  links: readonly FooterLink[]
}

export interface SiteFooterProps extends ComponentProps<'footer'> {
  /** Logo or product name. */
  brand: ReactNode
  /** One line about the product under the brand. */
  tagline?: ReactNode
  columns?: readonly FooterColumn[]
  /** e.g. "© 2026 Acme Inc." */
  copyright?: ReactNode
  /** Social icon links, shown at the end of the bottom row. */
  socials?: ReactNode
  /** Extra content in the bottom row, e.g. a theme switch or status link. */
  bottom?: ReactNode
}

/** Site-wide footer with link columns and a bottom row. */
export function SiteFooter({
  brand,
  tagline,
  columns = [],
  copyright,
  socials,
  bottom,
  className,
  ...props
}: SiteFooterProps) {
  useBlocksStylesCheck()
  const Link = useLinkComponent()
  const baseId = useId()
  return (
    <footer
      data-slot="site-footer"
      className={cn('border-t-(length:--glyph-border-width) border-border bg-subtle', className)}
      {...props}
    >
      <Container className="grid gap-12 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div className="grid h-fit gap-3">
            <div className="text-foreground">{brand}</div>
            {tagline && (
              <Text size="small" tone="muted" className="max-w-xs">
                {tagline}
              </Text>
            )}
          </div>
          {columns.length > 0 && (
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
              {columns.map((column, i) => (
                <nav
                  key={column.title}
                  aria-labelledby={`${baseId}-${i}`}
                  className="grid h-fit gap-3"
                >
                  <p id={`${baseId}-${i}`} className="text-small font-medium text-foreground">
                    {column.title}
                  </p>
                  <ul className="grid gap-2">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="rounded-xs text-small text-muted-foreground transition-colors duration-(--glyph-duration-fast) hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          )}
        </div>
        {(copyright || socials || bottom) && (
          <div className="flex flex-col gap-4 border-t-(length:--glyph-border-width) border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            {copyright && <p className="text-small text-faint-foreground">{copyright}</p>}
            {(bottom || socials) && (
              <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
                {bottom}
                {socials}
              </div>
            )}
          </div>
        )}
      </Container>
    </footer>
  )
}
