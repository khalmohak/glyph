import { Accordion as AccordionPrimitive } from 'radix-ui'
import { type ComponentProps, createContext, useContext } from 'react'
import { type SlotClasses, useComponentConfig } from '../../hooks/use-component-config'
import { ChevronDownIcon } from '../../internal/icons'
import { type AccordionVariants, accordionStyles } from './accordion.styles'

const AccordionContext = createContext<{
  s: ReturnType<typeof accordionStyles>
  slots: SlotClasses<'Accordion'>
} | null>(null)

function useParts() {
  return useContext(AccordionContext) ?? { s: accordionStyles(), slots: {} }
}

export type AccordionProps = ComponentProps<typeof AccordionPrimitive.Root> & AccordionVariants

/**
 * Stacked sections that expand one at a time (`type="single"`, collapsible) or
 * independently (`type="multiple"`). Good for FAQs and dense settings.
 */
export function Accordion(inProps: AccordionProps) {
  const [props, slots] = useComponentConfig('Accordion', inProps)
  const { variant, className, ...rest } = props
  const s = accordionStyles({ variant })
  return (
    <AccordionContext.Provider value={{ s, slots }}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        className={s.root({ class: [slots.root, className] })}
        {...(rest as ComponentProps<typeof AccordionPrimitive.Root>)}
      />
    </AccordionContext.Provider>
  )
}

export function AccordionItem({
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Item>) {
  const { s, slots } = useParts()
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={s.item({ class: [slots.item, className] })}
      {...props}
    />
  )
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  const { s, slots } = useParts()
  return (
    <AccordionPrimitive.Header className={s.header({ class: slots.header })}>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={s.trigger({ class: [slots.trigger, className] })}
        {...props}
      >
        {children}
        <ChevronDownIcon className={s.chevron({ class: slots.chevron })} />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  const { s, slots } = useParts()
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={s.content({ class: slots.content })}
      {...props}
    >
      <div className={s.contentInner({ class: [slots.contentInner, className] })}>{children}</div>
    </AccordionPrimitive.Content>
  )
}
