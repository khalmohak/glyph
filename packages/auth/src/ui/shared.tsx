import { AuthCard, type AuthCardProps } from '@glyphui/blocks'
import { type LinkComponentProps, Text, useComponentConfig, useLinkComponent } from '@glyphui/ui'
import { type ReactNode, useEffect, useState } from 'react'
import { isAuthError } from '../core/errors'
import { authNoticeStyles } from './auth.styles'

/** Props every auth screen shares. */
export interface AuthScreenProps {
  title?: ReactNode
  description?: ReactNode
  /** Heading level of the title. Default 1, for a page whose main content is the form. */
  headingLevel?: AuthCardProps['headingLevel']
  footer?: ReactNode
  className?: string
}

/**
 * Turns an adapter error into the result `<Form onSubmit>` expects: messages for known fields
 * show beside them, anything else above the form.
 */
export function toFormErrors(
  error: unknown,
  fieldNames: readonly string[],
): { errors: Record<string, string> } {
  if (!isAuthError(error)) throw error
  const errors: Record<string, string> = {}
  for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
    if (fieldNames.includes(field)) errors[field] = message
  }
  if (Object.keys(errors).length === 0) errors.root = error.message
  return { errors }
}

/** Seconds left before an action (like "Resend code") can run again. */
export function useCooldown(seconds: number): [remaining: number, start: () => void] {
  const [until, setUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (until <= now) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [until, now])
  return [
    Math.max(0, Math.ceil((until - now) / 1000)),
    () => {
      const start = Date.now()
      setNow(start)
      setUntil(start + seconds * 1000)
    },
  ]
}

export function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export interface AuthNoticeProps extends AuthScreenProps {
  icon?: ReactNode
  children?: ReactNode
  /** Buttons under the message. */
  actions?: ReactNode
}

/** A confirmation card: "Check your email", "Password updated", ... */
export function AuthNotice(inProps: AuthNoticeProps) {
  const [props, slots] = useComponentConfig('AuthNotice', inProps)
  const {
    icon = <MailIcon />,
    title,
    description,
    children,
    actions,
    footer,
    headingLevel,
    className,
  } = props
  const s = authNoticeStyles()
  return (
    <AuthCard
      title={
        <span className={s.root({ class: slots.root })}>
          <span className={s.icon({ class: slots.icon })}>{icon}</span>
          {title}
        </span>
      }
      description={description}
      footer={footer}
      className={className}
      {...(headingLevel && { headingLevel })}
    >
      {/* AuthCard renders its own form for undefined children, so pass false when empty. */}
      {children || actions ? (
        <div className="grid gap-3">
          {children && (
            <Text size="small" tone="muted" className="text-center">
              {children}
            </Text>
          )}
          {actions && <div className="grid gap-2">{actions}</div>}
        </div>
      ) : (
        false
      )}
    </AuthCard>
  )
}

/** A plain link through the app's router, for `<Button asChild>`. */
export function AppLink(props: LinkComponentProps) {
  const LinkComponent = useLinkComponent()
  return <LinkComponent {...props} />
}
