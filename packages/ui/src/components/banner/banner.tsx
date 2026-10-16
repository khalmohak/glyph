import { type ComponentProps, type ReactNode, useState } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { XIcon } from '../../internal/icons'
import { toneIcons } from '../alert/alert-icons'
import { IconButton } from '../button'
import { type BannerVariants, bannerStyles } from './banner.styles'

export interface BannerProps extends ComponentProps<'section'>, BannerVariants {
  /** Replaces the tone's default icon. `false` hides it. */
  icon?: ReactNode | false
  action?: ReactNode
  /** Shows a close button. */
  dismissible?: boolean
  /** Remembers the dismissal in localStorage under this key, so the banner stays hidden. */
  storageKey?: string
  onDismiss?: () => void
  dismissLabel?: string
}

function readDismissed(key: string | undefined): boolean {
  if (!key || typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(key) === 'dismissed'
  } catch {
    return false
  }
}

/** A full-width announcement at the top of a page or section. */
export function Banner(inProps: BannerProps) {
  const [props, slots] = useComponentConfig('Banner', inProps)
  const {
    tone,
    icon,
    action,
    dismissible = false,
    storageKey,
    onDismiss,
    dismissLabel = 'Dismiss',
    className,
    children,
    ...rest
  } = props
  const [dismissed, setDismissed] = useState(() => readDismissed(storageKey))
  if (dismissed) return null

  const resolvedTone = tone ?? 'neutral'
  const s = bannerStyles({ tone })
  const iconNode = icon === false ? null : (icon ?? toneIcons[resolvedTone]())

  const dismiss = () => {
    setDismissed(true)
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, 'dismissed')
      } catch {
        // Storage unavailable: the banner stays hidden for this visit only.
      }
    }
    onDismiss?.()
  }

  return (
    <section
      data-slot="banner"
      data-tone={resolvedTone}
      aria-label="Announcement"
      className={s.root({ class: [slots.root, className] })}
      {...rest}
    >
      <div className={s.inner({ class: slots.inner })}>
        {iconNode && (
          <span
            data-slot="banner-icon"
            className={s.icon({ class: slots.icon })}
            aria-hidden="true"
          >
            {iconNode}
          </span>
        )}
        <div data-slot="banner-content" className={s.content({ class: slots.content })}>
          {children}
        </div>
        {action && (
          <div data-slot="banner-action" className={s.action({ class: slots.action })}>
            {action}
          </div>
        )}
        {dismissible && (
          <IconButton
            size="sm"
            icon={<XIcon />}
            aria-label={dismissLabel}
            onClick={dismiss}
            className={s.dismiss({ class: slots.dismiss })}
          />
        )}
      </div>
    </section>
  )
}
