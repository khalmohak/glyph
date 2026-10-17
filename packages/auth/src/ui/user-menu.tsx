import {
  Avatar,
  type ColorModePreference,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  useColorMode,
  useComponentConfig,
  useLinkComponent,
} from '@glyphui/ui'
import type { ReactNode } from 'react'
import type { AuthUser } from '../core/types'
import { useAuth } from '../react/provider'
import { userMenuStyles } from './auth.styles'

export interface UserMenuItem {
  label: ReactNode
  /** Navigates through your router. */
  href?: string
  onSelect?: () => void
  icon?: ReactNode
}

export interface UserMenuProps {
  /** Links such as Profile and Settings, above Sign out. */
  items?: readonly UserMenuItem[]
  /** Adds a Theme submenu (light, dark, system). Default true. */
  colorMode?: boolean
  /** Avatar only, with the name and email kept for screen readers. */
  compact?: boolean
  /** Which side the menu opens on. Default `bottom`; use `top` in a sidebar footer. */
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  /** Called after signing out, e.g. to navigate to the landing page. */
  onSignOut?: () => void
  className?: string
}

function displayName(user: AuthUser): string {
  const { name, email } = user as { name?: string; email?: string }
  return name || email || 'Account'
}

function SignOutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

/** The signed-in user's avatar menu: name and email, your links, theme, and Sign out. */
export function UserMenu(inProps: UserMenuProps) {
  const [props, slots] = useComponentConfig('UserMenu', inProps)
  const {
    items = [],
    colorMode = true,
    compact,
    side = 'bottom',
    align = 'end',
    onSignOut,
    className,
  } = props
  const { user, signOut } = useAuth()
  const { mode, setMode } = useColorMode()
  const LinkComponent = useLinkComponent()
  if (!user) return null
  const s = userMenuStyles({ compact })
  const name = displayName(user)
  const { email, image } = user as { email?: string; image?: string }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="user-menu"
        className={s.trigger({ class: [slots.trigger, className] })}
        {...(compact && { 'aria-label': `Account menu for ${name}` })}
      >
        <Avatar name={name} src={image} size="sm" />
        <span className={s.details({ class: slots.details })}>
          <span className={s.name({ class: slots.name })}>{name}</span>
          {email && email !== name && (
            <span className={s.email({ class: slots.email })}>{email}</span>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} className="min-w-56">
        <DropdownMenuLabel className={s.header({ class: slots.header })}>
          <span className={s.name({ class: slots.name })}>{name}</span>
          {email && <span className={s.email({ class: slots.email })}>{email}</span>}
        </DropdownMenuLabel>
        {items.length > 0 && <DropdownMenuSeparator />}
        {items.map((item, index) =>
          item.href ? (
            <DropdownMenuItem key={index} icon={item.icon} asChild>
              <LinkComponent href={item.href}>{item.label}</LinkComponent>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem key={index} icon={item.icon} onSelect={item.onSelect}>
              {item.label}
            </DropdownMenuItem>
          ),
        )}
        {colorMode && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={mode}
                  onValueChange={(value) => setMode(value as ColorModePreference)}
                >
                  <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          icon={<SignOutIcon />}
          onSelect={async () => {
            await signOut()
            onSignOut?.()
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
