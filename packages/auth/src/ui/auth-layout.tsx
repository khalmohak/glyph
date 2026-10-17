import { useComponentConfig } from '@glyphui/ui'
import type { ReactNode } from 'react'
import { authLayoutStyles } from './auth.styles'

export interface AuthLayoutProps {
  /** Logo or product name, top left. */
  brand?: ReactNode
  /** The side panel on large screens: a testimonial, product shot or brand art. Hidden on mobile. */
  aside?: ReactNode
  /** Which side the panel sits on. Default right. */
  side?: 'left' | 'right'
  /** Small print under the form: legal links, copyright. */
  footer?: ReactNode
  /** The screen: SignInForm, SignUpForm, ... */
  children: ReactNode
  className?: string
}

/**
 * A full-page frame for auth screens: the form centered on one half, a brand panel on the
 * other. On small screens the panel hides and the form takes the page.
 */
export function AuthLayout(inProps: AuthLayoutProps) {
  const [props, slots] = useComponentConfig('AuthLayout', inProps)
  const { brand, aside, side, footer, children, className } = props
  const s = authLayoutStyles({ side })
  return (
    <div data-slot="auth-layout" className={s.root({ class: [slots.root, className] })}>
      <div className={s.main({ class: slots.main })}>
        {brand && <div className={s.brand({ class: slots.brand })}>{brand}</div>}
        <main className={s.content({ class: slots.content })}>{children}</main>
        {footer && <footer className={s.footer({ class: slots.footer })}>{footer}</footer>}
      </div>
      {aside && <aside className={s.aside({ class: slots.aside })}>{aside}</aside>}
    </div>
  )
}
