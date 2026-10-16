import { Slot } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { ChevronRightIcon } from '../../internal/icons'
import { useLinkComponent } from '../../provider/glyph-context'
import { breadcrumbStyles } from './breadcrumb.styles'

const s = breadcrumbStyles()

function useSlots() {
  return useComponentConfig('Breadcrumb', {})[1]
}

export interface BreadcrumbItemData {
  label: ReactNode
  /** Omit for the current page (normally the last item). */
  href?: string
}

export interface BreadcrumbProps extends ComponentProps<'nav'> {
  /** Data-driven trail. The last item is the current page. Omit to compose the parts yourself. */
  items?: readonly BreadcrumbItemData[]
  /** Custom separator between items. A chevron by default. */
  separator?: ReactNode
}

/** Shows where the current page sits in the hierarchy. */
export function Breadcrumb({ items, separator, className, children, ...props }: BreadcrumbProps) {
  const slots = useSlots()
  return (
    <nav
      aria-label="Breadcrumb"
      data-slot="breadcrumb"
      className={s.root({ class: [slots.root, className] })}
      {...props}
    >
      {items ? (
        <BreadcrumbList>
          {items.map((item, index) => {
            const last = index === items.length - 1
            return (
              <BreadcrumbItem key={index}>
                {last || !item.href ? (
                  <BreadcrumbPage aria-current={last ? 'page' : undefined}>
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}
                {!last && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
              </BreadcrumbItem>
            )
          })}
        </BreadcrumbList>
      ) : (
        children
      )}
    </nav>
  )
}

export function BreadcrumbList({ className, ...props }: ComponentProps<'ol'>) {
  const slots = useSlots()
  return (
    <ol
      data-slot="breadcrumb-list"
      className={s.list({ class: [slots.list, className] })}
      {...props}
    />
  )
}

export function BreadcrumbItem({ className, ...props }: ComponentProps<'li'>) {
  const slots = useSlots()
  return (
    <li
      data-slot="breadcrumb-item"
      className={s.item({ class: [slots.item, className] })}
      {...props}
    />
  )
}

export interface BreadcrumbLinkProps {
  href: string
  className?: string
  children?: ReactNode
  /** Render your own element (e.g. a router link) with breadcrumb link styles. */
  asChild?: boolean
}

export function BreadcrumbLink({ href, className, children, asChild }: BreadcrumbLinkProps) {
  const Link = useLinkComponent()
  const slots = useSlots()
  const classes = s.link({ class: [slots.link, className] })
  if (asChild) {
    return (
      <Slot.Root data-slot="breadcrumb-link" className={classes}>
        {children}
      </Slot.Root>
    )
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}

export function BreadcrumbPage({ className, ...props }: ComponentProps<'span'>) {
  const slots = useSlots()
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={s.page({ class: [slots.page, className] })}
      {...props}
    />
  )
}

export function BreadcrumbSeparator({ className, children, ...props }: ComponentProps<'span'>) {
  const slots = useSlots()
  return (
    <span
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={s.separator({ class: [slots.separator, className] })}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </span>
  )
}
