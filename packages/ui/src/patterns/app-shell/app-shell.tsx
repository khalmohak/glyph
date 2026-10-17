import { Dialog } from 'radix-ui'
import { type ComponentProps, type ReactNode, useEffect, useMemo, useState } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useMediaQuery } from '../../hooks/use-media-query'
import { type AppShellVariants, appShellStyles } from './app-shell.styles'
import { AppShellContext } from './app-shell-context'
import { SidebarTrigger } from './sidebar'

export interface AppShellProps extends Omit<ComponentProps<'div'>, 'children'>, AppShellVariants {
  /** A `<Sidebar>`. Shown fixed on desktop and in a drawer on mobile. */
  sidebar: ReactNode
  children: ReactNode
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** Shown next to the menu button in the mobile top bar. */
  mobileBrand?: ReactNode
}

/**
 * App layout: sidebar plus main content. Handles desktop collapse to an icon rail,
 * the mobile drawer (focus-trapped, closes on navigation), and the mobile top bar.
 *
 * `layout="page"` fills the viewport; `layout="embedded"` fills its parent.
 */
export function AppShell(inProps: AppShellProps) {
  const [props, slots] = useComponentConfig('AppShell', inProps)
  const {
    sidebar,
    children,
    collapsed: collapsedProp,
    defaultCollapsed = false,
    onCollapsedChange,
    mobileBrand,
    layout,
    className,
    ...rest
  } = props
  const [collapsed, setCollapsed] = useControllableState({
    value: collapsedProp,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const s = appShellStyles({ layout })

  // The drawer is for small screens: growing past `md` (rotating a tablet) closes it, so its
  // overlay and scroll lock don't stay on top of the desktop layout.
  const wide = useMediaQuery('(min-width: 768px)')
  useEffect(() => {
    if (wide) setMobileOpen(false)
  }, [wide])

  const desktop = useMemo(
    () => ({ collapsed, setCollapsed, mobileOpen, setMobileOpen, inDrawer: false }),
    [collapsed, setCollapsed, mobileOpen],
  )
  const drawer = useMemo(() => ({ ...desktop, collapsed: false, inDrawer: true }), [desktop])

  return (
    <AppShellContext.Provider value={desktop}>
      <div data-slot="app-shell" className={s.root({ class: [slots.root, className] })} {...rest}>
        <div className={s.sidebar({ class: slots.sidebar })}>{sidebar}</div>

        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className={s.overlay({ class: slots.overlay })} />
            <Dialog.Content
              className={s.drawer({ class: slots.drawer })}
              aria-describedby={undefined}
            >
              <Dialog.Title className="sr-only">Navigation</Dialog.Title>
              <AppShellContext.Provider value={drawer}>{sidebar}</AppShellContext.Provider>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <div data-slot="app-shell-main" className={s.main({ class: slots.main })}>
          <div className={s.mobileBar({ class: slots.mobileBar })}>
            <SidebarTrigger />
            {mobileBrand}
          </div>
          {children}
        </div>
      </div>
    </AppShellContext.Provider>
  )
}
