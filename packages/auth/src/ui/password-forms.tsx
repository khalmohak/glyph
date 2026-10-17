import { AuthCard } from '@glyphui/blocks'
import { Button, Input, InputOTP, Link, PasswordInput, REGEXP_ONLY_DIGITS } from '@glyphui/ui'
import { Form, FormError, FormField, FormSubmit, useForm } from '@glyphui/ui/form'
import { useState } from 'react'
import { useAuth } from '../react/provider'
import { email, fields, minLength, required, sameAs } from './schema'
import { AppLink, AuthNotice, type AuthScreenProps, CheckIcon, toFormErrors } from './shared'

export interface ForgotPasswordFormProps extends AuthScreenProps {
  /** Adds "Back to sign in" links. */
  signInHref?: string
  defaultEmail?: string
}

/**
 * Asks for an email and sends a reset link (or, for code-based backends, continues straight
 * to the code and new password). The confirmation never says whether the account exists.
 */
export function ForgotPasswordForm({
  signInHref,
  defaultEmail = '',
  title = 'Reset your password',
  description,
  headingLevel,
  footer,
  className,
}: ForgotPasswordFormProps) {
  const auth = useAuth()
  const byCode = auth.capabilities.passwordResetMethod === 'code'
  const [sent, setSent] = useState<string | null>(null)
  const [schema] = useState(() =>
    fields({ email: [required('Enter your email address.'), email()] }),
  )
  const form = useForm({ schema, defaultValues: { email: defaultEmail } })
  const shared = { headingLevel, className }
  const backLink = signInHref ? <Link href={signInHref}>Back to sign in</Link> : undefined

  if (sent && byCode)
    return <ResetPasswordForm {...shared} email={sent} {...(signInHref && { signInHref })} />
  if (sent)
    return (
      <AuthNotice
        {...shared}
        title="Check your email"
        footer={backLink}
        actions={
          <Button variant="ghost" onClick={() => setSent(null)}>
            Use a different email
          </Button>
        }
      >
        If an account exists for {sent}, you’ll get an email with a link to reset your password.
      </AuthNotice>
    )

  return (
    <AuthCard
      title={title}
      description={
        description ??
        (byCode
          ? 'Enter your account’s email and we’ll send you a code to reset your password.'
          : 'Enter your account’s email and we’ll send you a reset link.')
      }
      footer={footer ?? backLink}
      className={className}
      {...(headingLevel && { headingLevel })}
    >
      <Form
        form={form}
        className="grid gap-4"
        onSubmit={async (values) => {
          try {
            await auth.requestPasswordReset(values.email.trim())
            setSent(values.email.trim())
          } catch (error) {
            return toFormErrors(error, ['email'])
          }
        }}
      >
        <FormError />
        <FormField control={form.control} name="email" label="Email" required>
          {(field) => <Input type="email" autoComplete="email" inputMode="email" {...field} />}
        </FormField>
        <FormSubmit fullWidth>{byCode ? 'Send reset code' : 'Send reset link'}</FormSubmit>
      </Form>
    </AuthCard>
  )
}

export interface ResetPasswordFormProps extends AuthScreenProps {
  /** The token from the reset link, usually read from the URL. */
  token?: string
  /** For code-based resets: the address the code went to. Shows a code field. */
  email?: string
  /** Adds "Back to sign in" and the success screen's button. */
  signInHref?: string
  minPasswordLength?: number
  /** Called after the password changes. */
  onSuccess?: () => void
}

/** Choose a new password, from a reset link's token or an emailed code. */
export function ResetPasswordForm({
  token,
  email: address,
  signInHref,
  minPasswordLength = 8,
  onSuccess,
  title = 'Choose a new password',
  description,
  headingLevel,
  footer,
  className,
}: ResetPasswordFormProps) {
  const auth = useAuth()
  const [done, setDone] = useState(false)
  const needsCode = !token
  const [schema] = useState(() =>
    fields({
      code: needsCode ? [required('Enter the code from the email.')] : [],
      password: [required('Choose a new password.'), minLength(minPasswordLength)],
      confirm: [
        required('Repeat the new password.'),
        sameAs('password', 'The passwords don’t match.'),
      ],
    }),
  )
  const form = useForm({ schema, defaultValues: { code: '', password: '', confirm: '' } })

  if (done)
    return (
      <AuthNotice
        title="Password updated"
        icon={<CheckIcon />}
        className={className}
        {...(headingLevel && { headingLevel })}
        actions={
          signInHref ? (
            <Button asChild>
              <AppLink href={signInHref}>Sign in</AppLink>
            </Button>
          ) : undefined
        }
      >
        You can now sign in with your new password.
      </AuthNotice>
    )

  return (
    <AuthCard
      title={title}
      description={
        description ??
        (needsCode && address
          ? `Enter the code we sent to ${address} and a new password.`
          : undefined)
      }
      footer={footer ?? (signInHref ? <Link href={signInHref}>Back to sign in</Link> : undefined)}
      className={className}
      {...(headingLevel && { headingLevel })}
    >
      <Form
        form={form}
        className="grid gap-4"
        onSubmit={async (values) => {
          try {
            await auth.resetPassword({
              token: token ?? values.code,
              password: values.password,
              // A code is only meaningful together with the address it was sent to.
              ...(!token && address && { email: address }),
            })
            setDone(true)
            onSuccess?.()
          } catch (error) {
            return toFormErrors(error, ['code', 'password'])
          }
        }}
      >
        <FormError />
        {needsCode && (
          <FormField control={form.control} name="code" label="Reset code" required>
            {(field) => (
              <InputOTP
                pattern={REGEXP_ONLY_DIGITS}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
            )}
          </FormField>
        )}
        {/* A hidden username field lets password managers update the right entry. */}
        {address && <input type="email" autoComplete="username" value={address} readOnly hidden />}
        <FormField
          control={form.control}
          name="password"
          label="New password"
          description={`At least ${minPasswordLength} characters.`}
          required
        >
          {(field) => <PasswordInput autoComplete="new-password" showStrength {...field} />}
        </FormField>
        <FormField control={form.control} name="confirm" label="Repeat new password" required>
          {(field) => <PasswordInput autoComplete="new-password" {...field} />}
        </FormField>
        <FormSubmit fullWidth>Update password</FormSubmit>
      </Form>
    </AuthCard>
  )
}
