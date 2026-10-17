import { Tabs as TabsPrimitive } from 'radix-ui'
import { type ComponentProps, createContext, useContext, useId } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useControllableState } from '../../hooks/use-controllable-state'
import { ActiveIndicator } from '../../motion/active-indicator'
import { focusRing, themedBorder, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const tabsStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'flex flex-col gap-4',
    // Isolated so the sliding indicator stays under every tab's label while it moves.
    list: 'isolate flex items-center',
    trigger: [
      'relative inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap text-small font-medium text-muted-foreground',
      transition,
      focusRing,
      'hover:text-foreground data-[state=active]:text-foreground disabled:pointer-events-none disabled:opacity-50',
      '[&>svg]:size-4',
    ],
    /** Slides to the active tab. Underline bar or pill background, by variant. */
    indicator: 'pointer-events-none absolute',
    // Radix makes a panel a Tab stop when nothing inside is focusable, so show where focus is.
    content: [focusRing, 'rounded-sm'],
  },
  variants: {
    variant: {
      underline: {
        list: 'gap-5 border-b border-border',
        trigger: 'h-9',
        indicator: 'inset-x-0 -bottom-px h-0.5 rounded-pill bg-foreground',
      },
      pill: {
        list: ['inline-flex w-fit gap-0.5 rounded-md border-border bg-muted p-0.5', themedBorder],
        trigger: 'h-7 rounded-[calc(var(--radius-md)-2px)] px-3',
        indicator: 'inset-0 -z-10 rounded-[calc(var(--radius-md)-2px)] bg-raised shadow-xs',
      },
    },
  },
  defaultVariants: { variant: 'underline' },
})

type TabsVariants = VariantProps<typeof tabsStyles>
interface TabsContextValue extends TabsVariants {
  value?: string
  indicatorId?: string
}
const TabsContext = createContext<TabsContextValue>({})

export interface TabsProps extends ComponentProps<typeof TabsPrimitive.Root>, TabsVariants {}

export function Tabs(inProps: TabsProps) {
  const [props, slots] = useComponentConfig('Tabs', inProps)
  const { variant, className, value: valueProp, defaultValue, onValueChange, ...rest } = props
  // Tracked here so the active trigger can host the sliding indicator.
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  })
  const indicatorId = `${useId()}-tabs-indicator`
  return (
    <TabsContext.Provider value={{ variant, value, indicatorId }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        className={tabsStyles({ variant }).root({ class: [slots.root, className] })}
        value={value}
        onValueChange={setValue}
        {...rest}
      />
    </TabsContext.Provider>
  )
}

function useTabsParts() {
  const context = useContext(TabsContext)
  const [, slots] = useComponentConfig('Tabs', {})
  return { s: tabsStyles({ variant: context.variant }), slots, context }
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  const { s, slots } = useTabsParts()
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={s.list({ class: [slots.list, className] })}
      {...props}
    />
  )
}

export function TabsTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { s, slots, context } = useTabsParts()
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={s.trigger({ class: [slots.trigger, className] })}
      {...props}
    >
      {children}
      {context.indicatorId && context.value === props.value && (
        <ActiveIndicator
          layoutId={context.indicatorId}
          className={s.indicator({ class: slots.indicator })}
        />
      )}
    </TabsPrimitive.Trigger>
  )
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  const { s, slots } = useTabsParts()
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={s.content({ class: [slots.content, className] })}
      {...props}
    />
  )
}
