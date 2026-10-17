import { Alert, Button, Card, cn, Field, Heading, Input, Text } from '@glyphui/ui'
import { type ComponentProps, type FormEvent, type ReactNode, useId, useRef, useState } from 'react'
import { useBlocksStylesCheck } from '../internal/styles-check'
import type { HeadingLevel } from '../section-header'

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthCardProps extends Omit<ComponentProps<'div'>, 'title' | 'onSubmit'> {
  title: ReactNode
  description?: ReactNode
  /** Built-in email + password form. Throw to show the error's message above the form. */
  onSubmit?: (credentials: AuthCredentials) => Promise<void> | void
  submitLabel?: ReactNode
  /** `sign-in` uses current-password autocomplete; `sign-up` uses new-password and a minimum length. */
  mode?: 'sign-in' | 'sign-up'
  /** Shown beside the password label, e.g. a "Forgot password?" link. */
  passwordHint?: ReactNode
  /** Social sign-in buttons, shown above the form with a divider. */
  social?: ReactNode
  /** Label of the divider between social buttons and the form. */
  dividerLabel?: ReactNode
  /** Bottom line, e.g. "Don't have an account? Sign up". */
  footer?: ReactNode
  /** Replaces the built-in form with your own fields. */
  children?: ReactNode
  headingLevel?: HeadingLevel
}

/** Sign-in or sign-up card with a ready email and password form, or your own fields. */
export function AuthCard({
  title,
  description,
  onSubmit,
  submitLabel,
  mode = 'sign-in',
  passwordHint,
  social,
  dividerLabel = 'or',
  footer,
  children,
  headingLevel = 1,
  className,
  ...props
}: AuthCardProps) {
  useBlocksStylesCheck()
  const titleId = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inFlight = useRef(false)
  const minLength = mode === 'sign-up' ? 8 : 1

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // A ref, not state: a second submit can arrive before React re-renders the button.
    if (inFlight.current) return
    const next: typeof errors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'Enter a valid email address.'
    if (password.length < minLength) {
      next.password =
        mode === 'sign-up' ? `Use at least ${minLength} characters.` : 'Enter your password.'
    }
    setErrors(next)
    if (next.email || next.password || !onSubmit) return
    inFlight.current = true
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({ email: email.trim(), password })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Something went wrong. Try again.')
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  return (
    <Card
      data-slot="auth-card"
      role="region"
      aria-labelledby={titleId}
      padding="lg"
      className={cn('mx-auto w-full max-w-sm', className)}
      {...props}
    >
      <div className="grid gap-1.5 text-center">
        <Heading level={headingLevel} size="h3" id={titleId}>
          {title}
        </Heading>
        {description && (
          <Text size="small" tone="muted">
            {description}
          </Text>
        )}
      </div>

      {social && (
        <>
          <div className="grid gap-2">{social}</div>
          <div
            className="flex items-center gap-3 text-caption text-faint-foreground"
            aria-hidden="true"
          >
            <span className="h-px flex-1 bg-border" />
            {dividerLabel}
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      {children ?? (
        <form noValidate onSubmit={submit} className="grid gap-4">
          {formError && (
            <Alert tone="danger" icon={false}>
              {formError}
            </Alert>
          )}
          <Field label="Email" error={errors.email} required>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
            />
          </Field>
          <Field
            label="Password"
            labelAction={passwordHint}
            error={errors.password}
            description={
              mode === 'sign-up' && !errors.password
                ? `At least ${minLength} characters.`
                : undefined
            }
            required
          >
            <Input
              type="password"
              autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <Button type="submit" fullWidth loading={submitting}>
            {submitLabel ?? (mode === 'sign-up' ? 'Create account' : 'Sign in')}
          </Button>
        </form>
      )}

      {footer && <div className="text-center text-small text-muted-foreground">{footer}</div>}
    </Card>
  )
}
