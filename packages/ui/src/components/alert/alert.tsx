import type { ComponentProps, ReactNode } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { XIcon } from '../../internal/icons'
import { IconButton } from '../button'
import { type AlertVariants, alertStyles } from './alert.styles'
import { toneIcons } from './alert-icons'

export interface AlertProps extends Omit<ComponentProps<'div'>, 'title'>, AlertVariants {
  title?: ReactNode
  /** Replaces the tone's default icon. `false` hides it. */
  icon?: ReactNode | false
  /** Buttons or links shown at the end. */
  action?: ReactNode
  /** Shows a close button that calls this. */
  onDismiss?: () => void
  dismissLabel?: string
}

/**
 * An inline message about the content around it. Danger and warning alerts are announced
 * immediately (`role="alert"`); other tones politely (`role="status"`).
 */
export function Alert(inProps: AlertProps) {
  const [props, slots] = useComponentConfig('Alert', inProps)
  const {
    tone,
    variant,
    title,
    icon,
    action,
    onDismiss,
    dismissLabel = 'Dismiss',
    className,
    children,
    ...rest
  } = props
  const resolvedTone = tone ?? 'neutral'
  const s = alertStyles({ tone, variant })
  const iconNode = icon === false ? null : (icon ?? toneIcons[resolvedTone]())
  const urgent = resolvedTone === 'danger' || resolvedTone === 'warning'

  return (
    <div
      data-slot="alert"
      data-tone={resolvedTone}
      role={urgent ? 'alert' : 'status'}
      className={s.root({ class: [slots.root, className] })}
      {...rest}
    >
      {iconNode && (
        <span data-slot="alert-icon" className={s.icon({ class: slots.icon })} aria-hidden="true">
          {iconNode}
        </span>
      )}
      <div data-slot="alert-content" className={s.content({ class: slots.content })}>
        {title && (
          <p data-slot="alert-title" className={s.title({ class: slots.title })}>
            {title}
          </p>
        )}
        {children && (
          <div
            data-slot="alert-description"
            className={s.description({ class: slots.description })}
          >
            {children}
          </div>
        )}
      </div>
      {action && (
        <div data-slot="alert-action" className={s.action({ class: slots.action })}>
          {action}
        </div>
      )}
      {onDismiss && (
        <IconButton
          size="sm"
          icon={<XIcon />}
          aria-label={dismissLabel}
          onClick={onDismiss}
          className={s.dismiss({ class: slots.dismiss })}
        />
      )}
    </div>
  )
}
