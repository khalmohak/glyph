import { DropdownMenu as MenuPrimitive, Slot } from 'radix-ui'
import type { ComponentProps, ReactNode, SVGProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { dropdownMenuStyles } from './dropdown-menu.styles'

function useParts(tone?: 'default' | 'danger', inset?: boolean) {
  const [, slots] = useComponentConfig('DropdownMenu', {})
  return { s: dropdownMenuStyles({ tone, inset }), slots }
}

const svg = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const satisfies SVGProps<SVGSVGElement>

const CheckIcon = () => (
  <svg aria-hidden="true" {...svg}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
const DotIcon = () => (
  <svg aria-hidden="true" {...svg}>
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </svg>
)
const ChevronRightIcon = () => (
  <svg aria-hidden="true" {...svg}>
    <path d="m9 18 6-6-6-6" />
  </svg>
)

/**
 * A menu of actions opened from a button: row actions, account menus, "more" buttons.
 *
 * Not modal by default: focus moves into the menu and Escape or an outside click closes it,
 * but the rest of the page isn't hidden from assistive tech or locked. A modal menu would
 * set `aria-hidden` on a page that stays focusable. Pass `modal` for Radix's modal behavior.
 */
export function DropdownMenu({
  modal = false,
  ...props
}: ComponentProps<typeof MenuPrimitive.Root>) {
  return <MenuPrimitive.Root modal={modal} {...props} />
}
export const DropdownMenuTrigger = MenuPrimitive.Trigger
export const DropdownMenuGroup = MenuPrimitive.Group
export const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup
export const DropdownMenuSub = MenuPrimitive.Sub

export function DropdownMenuContent(inProps: ComponentProps<typeof MenuPrimitive.Content>) {
  const [props, slots] = useComponentConfig('DropdownMenu', inProps)
  const { sideOffset = 6, align = 'start', className, ...rest } = props
  const s = dropdownMenuStyles()
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={s.content({ class: [slots.content, className] })}
        {...rest}
      />
    </MenuPrimitive.Portal>
  )
}

export interface DropdownMenuItemProps extends ComponentProps<typeof MenuPrimitive.Item> {
  icon?: ReactNode
  /** Keyboard hint shown at the end, e.g. "⌘D". Display only. */
  shortcut?: ReactNode
  /** `danger` for destructive actions. */
  tone?: 'default' | 'danger'
  /** Indent to line up with checkbox and radio items. */
  inset?: boolean
}

/**
 * A menu action. With `asChild`, the item renders as its child (e.g. a router link) and the
 * icon and shortcut go inside it.
 */
export function DropdownMenuItem({
  icon,
  shortcut,
  tone,
  inset,
  asChild,
  className,
  children,
  ...props
}: DropdownMenuItemProps) {
  const { s, slots } = useParts(tone, inset)
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-tone={tone ?? 'default'}
      className={s.item({ class: [slots.item, className] })}
      {...(asChild && { asChild })}
      {...props}
    >
      {icon && (
        <span className={s.icon({ class: slots.icon })} aria-hidden="true">
          {icon}
        </span>
      )}
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
      {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
    </MenuPrimitive.Item>
  )
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
  const { s, slots } = useParts(undefined, true)
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={s.item({ class: [slots.item, className] })}
      {...props}
    >
      <span className={s.indicator({ class: slots.indicator })}>
        <MenuPrimitive.ItemIndicator>
          <CheckIcon />
        </MenuPrimitive.ItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof MenuPrimitive.RadioItem>) {
  const { s, slots } = useParts(undefined, true)
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={s.item({ class: [slots.item, className] })}
      {...props}
    >
      <span className={s.indicator({ class: slots.indicator })}>
        <MenuPrimitive.ItemIndicator>
          <DotIcon />
        </MenuPrimitive.ItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

export function DropdownMenuLabel({
  inset,
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Label> & { inset?: boolean }) {
  const { s, slots } = useParts(undefined, inset)
  return (
    <MenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={s.label({ class: [slots.label, className] })}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Separator>) {
  const { s, slots } = useParts()
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={s.separator({ class: [slots.separator, className] })}
      {...props}
    />
  )
}

export function DropdownMenuShortcut({ className, ...props }: ComponentProps<'span'>) {
  const { s, slots } = useParts()
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={s.shortcut({ class: [slots.shortcut, className] })}
      {...props}
    />
  )
}

export interface DropdownMenuSubTriggerProps
  extends ComponentProps<typeof MenuPrimitive.SubTrigger> {
  icon?: ReactNode
}

export function DropdownMenuSubTrigger({
  icon,
  className,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  const { s, slots } = useParts()
  return (
    <MenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={s.subTrigger({ class: [slots.subTrigger, className] })}
      {...props}
    >
      {icon && (
        <span className={s.icon({ class: slots.icon })} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
      <span className="ml-auto flex text-faint-foreground">
        <ChevronRightIcon />
      </span>
    </MenuPrimitive.SubTrigger>
  )
}

export function DropdownMenuSubContent({
  sideOffset = 4,
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.SubContent>) {
  const { s, slots } = useParts()
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        sideOffset={sideOffset}
        className={s.subContent({ class: [slots.subContent, className] })}
        {...props}
      />
    </MenuPrimitive.Portal>
  )
}
