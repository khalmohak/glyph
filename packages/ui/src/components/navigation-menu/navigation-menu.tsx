import { NavigationMenu as NavPrimitive } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useIsActive, useLinkComponent } from '../../provider/glyph-context'
import { navigationMenuStyles } from './navigation-menu.styles'

const s = navigationMenuStyles()

function useSlots() {
  return useComponentConfig('NavigationMenu', {})[1]
}

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export interface NavigationMenuProps extends ComponentProps<typeof NavPrimitive.Root> {
  /** Render the shared animated panel below the menu. Default true. */
  viewport?: boolean
}

/**
 * Site navigation with dropdown panels (mega menus) for marketing headers.
 * Keyboard: Tab between items, arrows inside panels, Escape to close.
 */
export function NavigationMenu(inProps: NavigationMenuProps) {
  const [props, slots] = useComponentConfig('NavigationMenu', inProps)
  const { viewport = true, className, children, ...rest } = props
  return (
    <NavPrimitive.Root
      data-slot="navigation-menu"
      className={s.root({ class: [slots.root, className] })}
      {...rest}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavPrimitive.Root>
  )
}

export function NavigationMenuList({
  className,
  ...props
}: ComponentProps<typeof NavPrimitive.List>) {
  const slots = useSlots()
  return (
    <NavPrimitive.List
      data-slot="navigation-menu-list"
      className={s.list({ class: [slots.list, className] })}
      {...props}
    />
  )
}

export function NavigationMenuItem({
  className,
  ...props
}: ComponentProps<typeof NavPrimitive.Item>) {
  const slots = useSlots()
  return (
    <NavPrimitive.Item
      data-slot="navigation-menu-item"
      className={s.item({ class: [slots.item, className] })}
      {...props}
    />
  )
}

export function NavigationMenuTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof NavPrimitive.Trigger>) {
  const slots = useSlots()
  return (
    <NavPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={s.trigger({ class: [slots.trigger, className] })}
      {...props}
    >
      {children}
      <ChevronDownIcon className={s.chevron({ class: slots.chevron })} />
    </NavPrimitive.Trigger>
  )
}

export function NavigationMenuContent({
  className,
  ...props
}: ComponentProps<typeof NavPrimitive.Content>) {
  const slots = useSlots()
  return (
    <NavPrimitive.Content
      data-slot="navigation-menu-content"
      className={s.content({ class: [slots.content, className] })}
      {...props}
    />
  )
}

export function NavigationMenuViewport({
  className,
  ...props
}: ComponentProps<typeof NavPrimitive.Viewport>) {
  const slots = useSlots()
  return (
    <div className={s.viewportWrapper({ class: slots.viewportWrapper })}>
      <NavPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={s.viewport({ class: [slots.viewport, className] })}
        {...props}
      />
    </div>
  )
}

export interface NavigationMenuLinkProps
  extends Omit<ComponentProps<typeof NavPrimitive.Link>, 'href'> {
  /** Rendered through the provider's `linkComponent`, so it uses your router. */
  href?: string
}

/**
 * A top-level link (no panel). Marked active automatically from the provider's `router`;
 * set `active` to override.
 */
export function NavigationMenuLink({
  href,
  active: activeProp,
  className,
  children,
  ...props
}: NavigationMenuLinkProps) {
  const slots = useSlots()
  const Link = useLinkComponent()
  const active = useIsActive(href, { explicit: activeProp })
  const cls = s.link({ class: [slots.link, className] })
  if (href === undefined) {
    return (
      <NavPrimitive.Link
        data-slot="navigation-menu-link"
        className={cls}
        active={active}
        {...props}
      >
        {children}
      </NavPrimitive.Link>
    )
  }
  return (
    <NavPrimitive.Link data-slot="navigation-menu-link" asChild active={active} {...props}>
      <Link href={href} className={cls}>
        {children}
      </Link>
    </NavPrimitive.Link>
  )
}

export interface NavigationMenuCardProps {
  href: string
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  className?: string
}

/** A link tile for mega-menu panels: icon, title and one line of description. */
export function NavigationMenuCard({
  href,
  title,
  description,
  icon,
  className,
}: NavigationMenuCardProps) {
  const slots = useSlots()
  const Link = useLinkComponent()
  return (
    <NavPrimitive.Link data-slot="navigation-menu-card" asChild>
      <Link href={href} className={s.card({ class: [slots.card, className] })}>
        {icon && (
          <span className={s.cardIcon({ class: slots.cardIcon })} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className={s.cardText({ class: slots.cardText })}>
          <span className={s.cardTitle({ class: slots.cardTitle })}>{title}</span>
          {description && (
            <span className={s.cardDescription({ class: slots.cardDescription })}>
              {description}
            </span>
          )}
        </span>
      </Link>
    </NavPrimitive.Link>
  )
}
