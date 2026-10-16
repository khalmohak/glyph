import { Dialog } from 'radix-ui'
import { type ComponentProps, type ReactNode, useState } from 'react'
import { IconButton } from '../../components/button'
import { Container, type ContainerProps } from '../../components/container'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useScrolled } from '../../hooks/use-scrolled'
import { MenuIcon, XIcon } from '../../internal/icons'
import { useLinkComponent } from '../../provider/glyph-context'
import { navbarStyles } from './app-shell.styles'

export interface NavLink {
  label: ReactNode
  href: string
  active?: boolean
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
  const Link = useLinkComponent()
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
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={link.active ? 'page' : undefined}
                className={s.link({ class: slots.link })}
              >
                {link.label}
              </Link>
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
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={link.active ? 'page' : undefined}
                    className={s.panelLink({ class: slots.panelLink })}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              {actions && (
                <div className={s.panelActions({ class: slots.panelActions })}>{actions}</div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Container>
    </header>
  )
}
