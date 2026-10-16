import type { ComponentProps, ReactNode } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { pageHeaderStyles } from './app-shell.styles'

export interface PageHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  title: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  /** Buttons aligned to the end on desktop. */
  actions?: ReactNode
}

/** Title block at the top of a page: optional eyebrow, title, description, actions. */
export function PageHeader(inProps: PageHeaderProps) {
  const [props, slots] = useComponentConfig('PageHeader', inProps)
  const { title, description, eyebrow, actions, className, ...rest } = props
  const s = pageHeaderStyles()
  return (
    <div data-slot="page-header" className={s.root({ class: [slots.root, className] })} {...rest}>
      <div className={s.text({ class: slots.text })}>
        {eyebrow && <p className={s.eyebrow({ class: slots.eyebrow })}>{eyebrow}</p>}
        <h1 className={s.title({ class: slots.title })}>{title}</h1>
        {description && (
          <p className={s.description({ class: slots.description })}>{description}</p>
        )}
      </div>
      {actions && <div className={s.actions({ class: slots.actions })}>{actions}</div>}
    </div>
  )
}
