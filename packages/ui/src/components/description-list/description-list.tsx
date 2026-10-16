import { type ComponentProps, createContext, type ReactNode, useContext } from 'react'
import { type SlotClasses, useComponentConfig } from '../../hooks/use-component-config'
import { type DescriptionListVariants, descriptionListStyles } from './description-list.styles'

type Styles = ReturnType<typeof descriptionListStyles>

const DescriptionListContext = createContext<{
  s: Styles
  slots: SlotClasses<'DescriptionList'>
} | null>(null)

export interface DescriptionListProps extends ComponentProps<'dl'>, DescriptionListVariants {}

/**
 * Label–value pairs, such as account details or order metadata.
 * `layout="inline"` puts terms and details side by side from the `sm` breakpoint.
 */
export function DescriptionList(inProps: DescriptionListProps) {
  const [props, slots] = useComponentConfig('DescriptionList', inProps)
  const { layout, dividers, className, ...rest } = props
  const s = descriptionListStyles({ layout, dividers })
  return (
    <DescriptionListContext.Provider value={{ s, slots }}>
      <dl
        data-slot="description-list"
        className={s.root({ class: [slots.root, className] })}
        {...rest}
      />
    </DescriptionListContext.Provider>
  )
}

export interface DescriptionItemProps extends Omit<ComponentProps<'div'>, 'children'> {
  term: ReactNode
  children: ReactNode
}

export function DescriptionItem({ term, children, className, ...props }: DescriptionItemProps) {
  const ctx = useContext(DescriptionListContext)
  const s = ctx?.s ?? descriptionListStyles()
  const slots = ctx?.slots ?? {}
  return (
    <div
      data-slot="description-item"
      className={s.item({ class: [slots.item, className] })}
      {...props}
    >
      <dt data-slot="description-term" className={s.term({ class: slots.term })}>
        {term}
      </dt>
      <dd data-slot="description-details" className={s.details({ class: slots.details })}>
        {children}
      </dd>
    </div>
  )
}
