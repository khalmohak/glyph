import type { ComponentProps, ElementType } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useLinkComponent } from '../../provider/glyph-context'
import { type LinkVariants, linkStyles } from './link.styles'

const ExternalIcon = (props: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M7 17 17 7M7 7h10v10" />
  </svg>
)

export interface LinkProps extends Omit<ComponentProps<'a'>, 'href'>, LinkVariants {
  href: string
  /** Opens in a new tab with `rel="noopener noreferrer"`, shows an arrow and announces it. */
  external?: boolean
}

/**
 * A text link with an animated underline. Internal links go through the provider's
 * `linkComponent` (your router); external links render a plain `<a>`.
 */
export function Link(inProps: LinkProps) {
  const [props, slots] = useComponentConfig('Link', inProps)
  const { href, external = false, tone, underline, className, children, ...rest } = props
  const RouterLink = useLinkComponent()
  const s = linkStyles({ tone, underline })
  const classes = s.base({ class: [slots.base, className] })

  if (external) {
    return (
      <a
        data-slot="link"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...rest}
      >
        {children}
        <ExternalIcon className={s.icon({ class: slots.icon })} />{' '}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    )
  }

  // Router links accept at least LinkComponentProps; extra anchor attributes pass through.
  const Comp = RouterLink as ElementType
  return (
    <Comp data-slot="link" href={href} className={classes} {...rest}>
      {children}
    </Comp>
  )
}
