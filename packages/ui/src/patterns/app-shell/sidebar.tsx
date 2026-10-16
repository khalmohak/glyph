import type { ComponentProps, MouseEvent, ReactNode } from 'react'
import { IconButton, type IconButtonProps } from '../../components/button'
import { Tooltip } from '../../components/tooltip'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useMediaQuery } from '../../hooks/use-media-query'
import { PanelLeftIcon } from '../../internal/icons'
import { useLinkComponent } from '../../provider/glyph-context'
import { sidebarStyles } from './app-shell.styles'
import { useAppShell } from './app-shell-context'

const s = sidebarStyles()

function useSlots() {
  return useComponentConfig('Sidebar', {})[1]
}

/** Navigation sidebar. Place inside `AppShell`'s `sidebar` prop. */
export function Sidebar({ className, ...props }: ComponentProps<'aside'>) {
  const { collapsed } = useAppShell()
  const slots = useSlots()
  return (
    <aside
      data-slot="sidebar"
      data-collapsed={collapsed}
      className={s.root({ class: [slots.root, className] })}
      {...props}
    />
  )
}

export function SidebarHeader({ className, ...props }: ComponentProps<'div'>) {
  const slots = useSlots()
  return (
    <div
      data-slot="sidebar-header"
      className={s.header({ class: [slots.header, className] })}
      {...props}
    />
  )
}

export function SidebarContent({ className, ...props }: ComponentProps<'nav'>) {
  const slots = useSlots()
  return (
    <nav
      data-slot="sidebar-content"
      aria-label="Main"
      className={s.content({ class: [slots.content, className] })}
      {...props}
    />
  )
}

export interface SidebarSectionProps extends ComponentProps<'div'> {
  label?: ReactNode
}

export function SidebarSection({ label, className, children, ...props }: SidebarSectionProps) {
  const slots = useSlots()
  return (
    <div
      data-slot="sidebar-section"
      className={s.section({ class: [slots.section, className] })}
      {...props}
    >
      {label && <p className={s.sectionLabel({ class: slots.sectionLabel })}>{label}</p>}
      {children}
    </div>
  )
}

export interface SidebarItemProps {
  /** Renders a link through the provider's `linkComponent`. Without it, renders a button. */
  href?: string
  icon?: ReactNode
  /** Count or short status shown at the end. */
  badge?: ReactNode
  active?: boolean
  onClick?: (event: MouseEvent<HTMLElement>) => void
  className?: string
  children: ReactNode
}

export function SidebarItem({
  href,
  icon,
  badge,
  active,
  onClick,
  className,
  children,
}: SidebarItemProps) {
  const { collapsed, inDrawer, setMobileOpen } = useAppShell()
  const Link = useLinkComponent()
  const slots = useSlots()

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    onClick?.(event)
    if (inDrawer) setMobileOpen(false)
  }

  const content = (
    <>
      {icon && (
        <span className={s.itemIcon({ class: slots.itemIcon })} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={s.itemLabel({ class: slots.itemLabel })}>{children}</span>
      {badge !== undefined && (
        <span className={s.itemBadge({ class: slots.itemBadge })}>{badge}</span>
      )}
    </>
  )
  const shared = {
    'data-slot': 'sidebar-item',
    'aria-current': active ? ('page' as const) : undefined,
    className: s.item({ class: [slots.item, className] }),
  }

  const element = href ? (
    <Link href={href} onClick={handleClick} {...shared}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={handleClick} {...shared}>
      {content}
    </button>
  )

  return (
    <Tooltip content={children} side="right" disabled={!collapsed}>
      {element}
    </Tooltip>
  )
}

export function SidebarFooter({ className, ...props }: ComponentProps<'div'>) {
  const slots = useSlots()
  return (
    <div
      data-slot="sidebar-footer"
      className={s.footer({ class: [slots.footer, className] })}
      {...props}
    />
  )
}

/** Collapses the sidebar on desktop; opens the navigation drawer on mobile. */
export function SidebarTrigger(props: Partial<IconButtonProps>) {
  const { collapsed, setCollapsed, setMobileOpen, inDrawer } = useAppShell()
  const desktop = useMediaQuery('(min-width: 48rem)')
  if (inDrawer) return null
  return (
    <IconButton
      icon={<PanelLeftIcon />}
      aria-label={desktop ? (collapsed ? 'Expand sidebar' : 'Collapse sidebar') : 'Open navigation'}
      size="sm"
      onClick={() => (desktop ? setCollapsed(!collapsed) : setMobileOpen(true))}
      {...props}
    />
  )
}
