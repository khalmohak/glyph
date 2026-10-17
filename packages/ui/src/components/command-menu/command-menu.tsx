import { Command as Cmdk } from 'cmdk'
import { Dialog } from 'radix-ui'
import {
  type ComponentProps,
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
} from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useControllableState } from '../../hooks/use-controllable-state'
import { SearchIcon } from '../../internal/icons'
import { Kbd } from '../kbd'
import { commandMenuStyles } from './command-menu.styles'

const s = commandMenuStyles()

const CommandMenuContext = createContext<{ close: () => void } | null>(null)

function useSlots() {
  return useComponentConfig('CommandMenu', {})[1]
}

export interface CommandMenuProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Accessible name of the dialog and list. */
  label?: string
  /** Wrap around from the last item to the first with arrow keys. Default true. */
  loop?: boolean
  /** Replace cmdk's fuzzy ranking. Return 0 to hide an item, higher numbers to rank it first. */
  filter?: (value: string, search: string, keywords?: string[]) => number
  className?: string
  children: ReactNode
}

/**
 * A ⌘K command palette in a modal dialog: search, grouped actions, keyboard navigation.
 * Pair with `useCommandMenuShortcut(setOpen)` to open it from the keyboard.
 */
export function CommandMenu(inProps: CommandMenuProps) {
  const [props, slots] = useComponentConfig('CommandMenu', inProps)
  const {
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    label = 'Command menu',
    loop = true,
    filter,
    className,
    children,
  } = props
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={s.overlay({ class: slots.overlay })} />
        <Dialog.Content
          data-slot="command-menu"
          aria-describedby={undefined}
          className={s.content({ class: [slots.content, className] })}
        >
          <Dialog.Title className="sr-only">{label}</Dialog.Title>
          <CommandMenuContext.Provider value={{ close: () => setOpen(false) }}>
            <Command label={label} loop={loop} {...(filter && { filter })}>
              {children}
            </Command>
          </CommandMenuContext.Provider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** The palette without a dialog, for inline search panels. */
export function Command({ className, ...props }: ComponentProps<typeof Cmdk>) {
  const slots = useSlots()
  return (
    <Cmdk data-slot="command" className={s.root({ class: [slots.root, className] })} {...props} />
  )
}

export function CommandInput({ className, ...props }: ComponentProps<typeof Cmdk.Input>) {
  const slots = useSlots()
  return (
    <div className={s.search({ class: slots.search })}>
      <SearchIcon />
      <Cmdk.Input
        data-slot="command-input"
        className={s.input({ class: [slots.input, className] })}
        {...props}
      />
    </div>
  )
}

export function CommandList({ className, ...props }: ComponentProps<typeof Cmdk.List>) {
  const slots = useSlots()
  return (
    <Cmdk.List
      data-slot="command-list"
      className={s.list({ class: [slots.list, className] })}
      {...props}
    />
  )
}

export function CommandEmpty({
  className,
  children = 'No results',
  ...props
}: ComponentProps<typeof Cmdk.Empty>) {
  const slots = useSlots()
  return (
    <Cmdk.Empty
      data-slot="command-empty"
      className={s.empty({ class: [slots.empty, className] })}
      {...props}
    >
      {children}
    </Cmdk.Empty>
  )
}

export function CommandGroup({ className, ...props }: ComponentProps<typeof Cmdk.Group>) {
  const slots = useSlots()
  return (
    <Cmdk.Group
      data-slot="command-group"
      className={s.group({ class: [slots.group, className] })}
      {...props}
    />
  )
}

export interface CommandItemProps extends ComponentProps<typeof Cmdk.Item> {
  icon?: ReactNode
  /** Keyboard hint shown at the end, e.g. `"⌘N"` or `["⌘", "N"]`. Display only. */
  shortcut?: string | readonly string[]
  /** Close the surrounding CommandMenu after selecting. Default true. */
  closeOnSelect?: boolean
}

export function CommandItem({
  icon,
  shortcut,
  closeOnSelect = true,
  onSelect,
  className,
  children,
  ...props
}: CommandItemProps) {
  const slots = useSlots()
  const menu = useContext(CommandMenuContext)
  const keys = shortcut === undefined ? [] : typeof shortcut === 'string' ? [shortcut] : shortcut
  return (
    <Cmdk.Item
      data-slot="command-item"
      onSelect={(value) => {
        onSelect?.(value)
        if (closeOnSelect) menu?.close()
      }}
      className={s.item({ class: [slots.item, className] })}
      {...props}
    >
      {icon && (
        <span className={s.itemIcon({ class: slots.itemIcon })} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={s.itemLabel({ class: slots.itemLabel })}>{children}</span>
      {keys.length > 0 && (
        <span className={s.shortcut({ class: slots.shortcut })} aria-hidden="true">
          {keys.map((key) => (
            <Kbd key={key}>{key}</Kbd>
          ))}
        </span>
      )}
    </Cmdk.Item>
  )
}

export function CommandSeparator({ className, ...props }: ComponentProps<typeof Cmdk.Separator>) {
  const slots = useSlots()
  return (
    <Cmdk.Separator
      data-slot="command-separator"
      className={s.separator({ class: [slots.separator, className] })}
      {...props}
    />
  )
}

/** Toggles a command menu with ⌘K (macOS) or Ctrl+K. Pass another key to change it. */
export function useCommandMenuShortcut(
  setOpen: Dispatch<SetStateAction<boolean>>,
  key = 'k',
): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Autofill fires keydown events without a `key`; holding the shortcut shouldn't flicker.
      if (typeof event.key !== 'string' || event.repeat) return
      if (event.key.toLowerCase() === key.toLowerCase() && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [setOpen, key])
}
