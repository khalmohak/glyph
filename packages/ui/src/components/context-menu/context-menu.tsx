import { ContextMenu as MenuPrimitive } from 'radix-ui'
import type { ComponentProps, ReactNode, SVGProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { contextMenuStyles } from './context-menu.styles'

function useParts(tone?: 'default' | 'danger', inset?: boolean) {
  const [, slots] = useComponentConfig('ContextMenu', {})
  return { s: contextMenuStyles({ tone, inset }), slots }
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

/** A menu opened by right-click or long-press on an area. Same items as DropdownMenu. */
export const ContextMenu = MenuPrimitive.Root
export const ContextMenuTrigger = MenuPrimitive.Trigger
export const ContextMenuGroup = MenuPrimitive.Group
export const ContextMenuRadioGroup = MenuPrimitive.RadioGroup
export const ContextMenuSub = MenuPrimitive.Sub

export function ContextMenuContent(inProps: ComponentProps<typeof MenuPrimitive.Content>) {
  const [props, slots] = useComponentConfig('ContextMenu', inProps)
  const { className, ...rest } = props
  const s = contextMenuStyles()
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        data-slot="context-menu-content"
        className={s.content({ class: [slots.content, className] })}
        {...rest}
      />
    </MenuPrimitive.Portal>
  )
}

export interface ContextMenuItemProps extends ComponentProps<typeof MenuPrimitive.Item> {
  icon?: ReactNode
  /** Keyboard hint shown at the end, e.g. "⌘C". Display only. */
  shortcut?: ReactNode
  /** `danger` for destructive actions. */
  tone?: 'default' | 'danger'
  /** Indent to line up with checkbox and radio items. */
  inset?: boolean
}

export function ContextMenuItem({
  icon,
  shortcut,
  tone,
  inset,
  className,
  children,
  ...props
}: ContextMenuItemProps) {
  const { s, slots } = useParts(tone, inset)
  return (
    <MenuPrimitive.Item
      data-slot="context-menu-item"
      data-tone={tone ?? 'default'}
      className={s.item({ class: [slots.item, className] })}
      {...props}
    >
      {icon && (
        <span className={s.icon({ class: slots.icon })} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
      {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
    </MenuPrimitive.Item>
  )
}

export function ContextMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
  const { s, slots } = useParts(undefined, true)
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
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

export function ContextMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof MenuPrimitive.RadioItem>) {
  const { s, slots } = useParts(undefined, true)
  return (
    <MenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
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

export function ContextMenuLabel({
  inset,
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Label> & { inset?: boolean }) {
  const { s, slots } = useParts(undefined, inset)
  return (
    <MenuPrimitive.Label
      data-slot="context-menu-label"
      className={s.label({ class: [slots.label, className] })}
      {...props}
    />
  )
}

export function ContextMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Separator>) {
  const { s, slots } = useParts()
  return (
    <MenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={s.separator({ class: [slots.separator, className] })}
      {...props}
    />
  )
}

export function ContextMenuShortcut({ className, ...props }: ComponentProps<'span'>) {
  const { s, slots } = useParts()
  return (
    <span
      data-slot="context-menu-shortcut"
      className={s.shortcut({ class: [slots.shortcut, className] })}
      {...props}
    />
  )
}

export interface ContextMenuSubTriggerProps
  extends ComponentProps<typeof MenuPrimitive.SubTrigger> {
  icon?: ReactNode
}

export function ContextMenuSubTrigger({
  icon,
  className,
  children,
  ...props
}: ContextMenuSubTriggerProps) {
  const { s, slots } = useParts()
  return (
    <MenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
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

export function ContextMenuSubContent({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.SubContent>) {
  const { s, slots } = useParts()
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.SubContent
        data-slot="context-menu-sub-content"
        className={s.subContent({ class: [slots.subContent, className] })}
        {...props}
      />
    </MenuPrimitive.Portal>
  )
}
