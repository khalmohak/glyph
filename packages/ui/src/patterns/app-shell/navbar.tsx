import { Dialog } from 'radix-ui'
import { type ComponentProps, type MouseEvent, type ReactNode, useEffect, useState } from 'react'
import { IconButton } from '../../components/button'
import { Container, type ContainerProps } from '../../components/container'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useMediaQuery } from '../../hooks/use-media-query'
import { useScrolled } from '../../hooks/use-scrolled'
import { MenuIcon, XIcon } from '../../internal/icons'
import { useIsActive, useLinkComponent } from '../../provider/glyph-context'
import { navbarStyles } from './app-shell.styles'

export interface NavLink {
  label: ReactNode
  href: string
  /** Marks the current page. Computed from the provider's `router` when not set. */
  active?: boolean
  /** With automatic matching, only the exact path is active (not its children). */
  end?: boolean
}

function NavbarLink({
  link,
  className,
  onClick,
}: {
  link: NavLink
  className: string
  onClick?: () => void
}) {
  const Link = useLinkComponent()
  const active = useIsActive(link.href, {
    explicit: link.active,
    ...(link.end !== undefined && { end: link.end }),
  })
  return (
    <Link
      href={link.href}
      aria-current={active ? 'page' : undefined}
      className={className}
      {...(onClick && { onClick })}
    >
      {link.label}
    </Link>
  )
}

export interface NavbarProps extends Omit<ComponentProps<'header'>, 'children'> {
  brand: ReactNode
  links?: readonly NavLink[]
  /** Right side on desktop; bottom of the menu panel on mobile. */
  actions?: ReactNode
  /** Stick to the top of the viewport. Default true. */
  sticky?: boolean
  /** Transparent at the top; translucent with blur and a border once scrolled. Default true. */
  blurOnScroll?: boolean
  containerSize?: ContainerProps['size']
}

/**
 * Site header from data: brand, links, actions. Responsive out of the box: links collapse
 * into a focus-trapped menu panel on small screens.
 */
export function Navbar(inProps: NavbarProps) {
  const [props, slots] = useComponentConfig('Navbar', inProps)
  const {
    brand,
    links = [],
    actions,
    sticky = true,
    blurOnScroll = true,
    containerSize,
    className,
    ...rest
  } = props
  const [open, setOpen] = useState(false)
  const scrolled = useScrolled(8, blurOnScroll)
  // The menu panel is for small screens: close it when the window grows past `md`.
  const wide = useMediaQuery('(min-width: 768px)')
  useEffect(() => {
    if (wide) setOpen(false)
  }, [wide])
  // Using an action in the panel (Sign in, a same-page link) closes it, like the links do.
  // Popup triggers (a user menu) keep it open so their menu can show.
  const closeOnAction = (event: MouseEvent<HTMLElement>) => {
    const target = (event.target as Element).closest('a, button')
    if (target && !target.hasAttribute('aria-haspopup')) setOpen(false)
  }
  const s = navbarStyles({ sticky, blur: blurOnScroll })

  return (
    <header
      data-slot="navbar"
      data-scrolled={scrolled}
      className={s.root({ class: [slots.root, className] })}
      {...rest}
    >
      <Container size={containerSize} className={s.inner({ class: slots.inner })}>
        <div className={s.brand({ class: slots.brand })}>{brand}</div>
        {links.length > 0 && (
          <nav aria-label="Main" className={s.links({ class: slots.links })}>
            {links.map((link, i) => (
              <NavbarLink
                // Placeholder links often share an href ("#").
                key={`${i}:${link.href}`}
                link={link}
                className={s.link({ class: slots.link })}
              />
            ))}
          </nav>
        )}
        {actions && <div className={s.actions({ class: slots.actions })}>{actions}</div>}

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <IconButton
              icon={<MenuIcon />}
              aria-label="Open menu"
              className={s.menuButton({ class: slots.menuButton })}
            />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className={s.overlay({ class: slots.overlay })} />
            <Dialog.Content
              className={s.panel({ class: slots.panel })}
              aria-describedby={undefined}
            >
              <div className={s.panelHeader({ class: slots.panelHeader })}>
                <Dialog.Title asChild>
                  <div className={s.brand({ class: slots.brand })}>{brand}</div>
                </Dialog.Title>
                <Dialog.Close asChild>
                  <IconButton icon={<XIcon />} aria-label="Close menu" />
                </Dialog.Close>
              </div>
              <nav aria-label="Main" className={s.panelLinks({ class: slots.panelLinks })}>
                {links.map((link, i) => (
                  <NavbarLink
                    key={`${i}:${link.href}`}
                    link={link}
                    className={s.panelLink({ class: slots.panelLink })}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </nav>
              {actions && (
                // biome-ignore lint/a11y/noStaticElementInteractions: delegates clicks from the buttons and links inside
                // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation of those controls fires click too
                <div
                  className={s.panelActions({ class: slots.panelActions })}
                  onClick={closeOnAction}
                >
                  {actions}
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Container>
    </header>
  )
}
