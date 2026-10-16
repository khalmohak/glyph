import { Slot } from 'radix-ui'
import { type ComponentProps, createContext, useContext } from 'react'
import { type SlotClasses, useComponentConfig } from '../../hooks/use-component-config'
import { type CardVariants, cardStyles } from './card.styles'

type CardStyles = ReturnType<typeof cardStyles>

const CardContext = createContext<{ s: CardStyles; slots: SlotClasses<'Card'> } | null>(null)

function useCardParts() {
  const ctx = useContext(CardContext)
  return ctx ?? { s: cardStyles(), slots: {} }
}

export interface CardProps extends ComponentProps<'div'>, CardVariants {
  asChild?: boolean
}

/** A surface that groups related content. Compose with CardHeader, CardTitle, CardBody, CardFooter. */
export function Card(inProps: CardProps) {
  const [props, slots] = useComponentConfig('Card', inProps)
  const { variant, padding, asChild, className, ...rest } = props
  const s = cardStyles({ variant, padding })
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <CardContext.Provider value={{ s, slots }}>
      <Comp
        data-slot="card"
        data-variant={variant}
        className={s.root({ class: [slots.root, className] })}
        {...rest}
      />
    </CardContext.Provider>
  )
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  const { s, slots } = useCardParts()
  return (
    <div
      data-slot="card-header"
      className={s.header({ class: [slots.header, className] })}
      {...props}
    />
  )
}

export interface CardTitleProps extends ComponentProps<'h3'> {
  asChild?: boolean
}

export function CardTitle({ asChild, className, ...props }: CardTitleProps) {
  const { s, slots } = useCardParts()
  const Comp = asChild ? Slot.Root : 'h3'
  return (
    <Comp
      data-slot="card-title"
      className={s.title({ class: [slots.title, className] })}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  const { s, slots } = useCardParts()
  return (
    <p
      data-slot="card-description"
      className={s.description({ class: [slots.description, className] })}
      {...props}
    />
  )
}

export function CardBody({ className, ...props }: ComponentProps<'div'>) {
  const { s, slots } = useCardParts()
  return (
    <div data-slot="card-body" className={s.body({ class: [slots.body, className] })} {...props} />
  )
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  const { s, slots } = useCardParts()
  return (
    <div
      data-slot="card-footer"
      className={s.footer({ class: [slots.footer, className] })}
      {...props}
    />
  )
}
