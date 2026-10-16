import { Tabs as TabsPrimitive } from 'radix-ui'
import { type ComponentProps, createContext, useContext } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { focusRing, themedBorder, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const tabsStyles = tv({
  slots: {
    root: 'flex flex-col gap-4',
    list: 'flex items-center',
    trigger: [
      'relative inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap text-small font-medium text-muted-foreground',
      transition,
      focusRing,
      'hover:text-foreground data-[state=active]:text-foreground disabled:pointer-events-none disabled:opacity-50',
      '[&>svg]:size-4',
    ],
    content: 'outline-none',
  },
  variants: {
    variant: {
      underline: {
        list: 'gap-5 border-b border-border',
        trigger:
          'h-9 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-pill after:bg-transparent data-[state=active]:after:bg-foreground',
      },
      pill: {
        list: ['inline-flex w-fit gap-0.5 rounded-md border-border bg-muted p-0.5', themedBorder],
        trigger:
          'h-7 rounded-[calc(var(--radius-md)-2px)] px-3 data-[state=active]:bg-raised data-[state=active]:shadow-xs',
      },
    },
  },
  defaultVariants: { variant: 'underline' },
})

type TabsVariants = VariantProps<typeof tabsStyles>
const TabsContext = createContext<TabsVariants>({})

export interface TabsProps extends ComponentProps<typeof TabsPrimitive.Root>, TabsVariants {}

export function Tabs(inProps: TabsProps) {
  const [{ variant, className, ...rest }, slots] = useComponentConfig('Tabs', inProps)
  return (
    <TabsContext.Provider value={{ variant }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        className={tabsStyles({ variant }).root({ class: [slots.root, className] })}
        {...rest}
      />
    </TabsContext.Provider>
  )
}

function useTabsParts() {
  const { variant } = useContext(TabsContext)
  const [, slots] = useComponentConfig('Tabs', {})
  return { s: tabsStyles({ variant }), slots }
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

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { s, slots } = useTabsParts()
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={s.trigger({ class: [slots.trigger, className] })}
      {...props}
    />
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
