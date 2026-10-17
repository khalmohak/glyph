import { AuthCard } from '@glyphui/blocks'
import { Button, Input, Link, PasswordInput } from '@glyphui/ui'
import { Form, FormError, FormField, FormSubmit, useForm } from '@glyphui/ui/form'
import { type ReactNode, useRef, useState } from 'react'
import type { AuthSession, OAuthProvider } from '../core/types'
import { useAuth } from '../react/provider'
import { TwoFactorForm, VerifyEmailForm } from './code-forms'
import { email, fields, required } from './schema'
import { AuthNotice, type AuthScreenProps, toFormErrors, useCooldown } from './shared'
import { SocialButtons } from './social-buttons'

export interface SignInFormProps extends AuthScreenProps {
  /** Called once the user is fully signed in (after any code steps). */
  onSuccess?: (session: AuthSession) => void
  /** Adds "New here? Create an account" linking here. */
  signUpHref?: string
  /** Adds a "Forgot password?" link beside the password label. */
  forgotPasswordHref?: string
  /** Offer "Email me a sign-in link" when the adapter supports it. Default true. */
  magicLink?: boolean
  /** OAuth buttons to show. Default: every provider the adapter supports; `[]` for none. */
  providers?: readonly OAuthProvider[]
  defaultEmail?: string
}

type Step =
  | { step: 'credentials' }
  | { step: 'verify'; email: string }
  | { step: 'two-factor' }
  | { step: 'magic-link'; email: string }

/**
 * A complete sign-in flow on one component: email and password, OAuth buttons, an email
 * link option, and the follow-up steps (email code, two-step code) when the backend asks.
 */
export function SignInForm({
  onSuccess,
  signUpHref,
  forgotPasswordHref,
  magicLink = true,
  providers,
  defaultEmail = '',
  title = 'Welcome back',
  description = 'Sign in to continue.',
  headingLevel,
  footer,
  className,
}: SignInFormProps) {
  const auth = useAuth()
  const [state, setState] = useState<Step>({ step: 'credentials' })
  const [usePassword, setUsePassword] = useState(true)
  const passwordMode = useRef(true)
  passwordMode.current = usePassword
  const [schema] = useState(() =>
    fields({
      email: [required('Enter your email address.'), email()],
      password: [
        (value: string) => (passwordMode.current && !value ? 'Enter your password.' : undefined),
      ],
    }),
  )
  const form = useForm({ schema, defaultValues: { email: defaultEmail, password: '' } })
  const offerMagicLink = magicLink && auth.capabilities.magicLink
  const shared = { headingLevel, className }

  if (state.step === 'verify')
    return auth.capabilities.emailCode ? (
      <VerifyEmailForm
        {...shared}
        email={state.email}
        onBack={() => setState({ step: 'credentials' })}
        {...(onSuccess && { onSuccess })}
      />
    ) : (
      <AuthNotice
        {...shared}
        title="Verify your email first"
        actions={
          <Button variant="outline" onClick={() => setState({ step: 'credentials' })}>
            Back to sign in
          </Button>
        }
      >
        We sent a verification link to {state.email}. Open it, then sign in again.
      </AuthNotice>
    )
  if (state.step === 'two-factor')
    return (
      <TwoFactorForm
        {...shared}
        onBack={() => setState({ step: 'credentials' })}
        {...(onSuccess && { onSuccess })}
      />
    )
  if (state.step === 'magic-link')
    return (
      <MagicLinkSent
        {...shared}
        email={state.email}
        onBack={() => {
          setUsePassword(true)
          setState({ step: 'credentials' })
        }}
      />
    )

  const signUpFooter: ReactNode =
    footer ??
    (signUpHref && auth.capabilities.signUp ? (
      <>
        New here? <Link href={signUpHref}>Create an account</Link>
      </>
    ) : undefined)

  return (
    <AuthCard
      title={title}
      description={description}
      footer={signUpFooter}
      social={
        (providers ?? auth.capabilities.oauthProviders).length > 0 ? (
          <SocialButtons {...(providers && { providers })} {...(onSuccess && { onSuccess })} />
        ) : undefined
      }
      dividerLabel="or with email"
      className={className}
      {...(headingLevel && { headingLevel })}
    >
      <Form
        form={form}
        className="grid gap-4"
        onSubmit={async (values) => {
          try {
            const result = usePassword
              ? await auth.signIn({ email: values.email.trim(), password: values.password })
              : await auth.signIn({ email: values.email.trim(), magicLink: true })
            if (result.status === 'signed-in') onSuccess?.(result.session)
            else if (result.status === 'needs-verification')
              setState({ step: 'verify', email: result.email })
            else if (result.status === 'needs-second-factor') setState({ step: 'two-factor' })
            else if (result.status === 'magic-link-sent')
              setState({ step: 'magic-link', email: result.email })
          } catch (error) {
            return toFormErrors(error, ['email', 'password'])
          }
        }}
      >
        <FormError />
        <FormField control={form.control} name="email" label="Email" required>
          {(field) => (
            <Input
              type="email"
              autoComplete="username"
              inputMode="email"
              placeholder="you@company.com"
              {...field}
            />
          )}
        </FormField>
        {usePassword && (
          <FormField
            control={form.control}
            name="password"
            label="Password"
            required
            {...(forgotPasswordHref &&
              auth.capabilities.passwordReset && {
                labelAction: <Link href={forgotPasswordHref}>Forgot password?</Link>,
              })}
          >
            {(field) => <PasswordInput autoComplete="current-password" {...field} />}
          </FormField>
        )}
        <FormSubmit fullWidth>{usePassword ? 'Sign in' : 'Email me a sign-in link'}</FormSubmit>
        {offerMagicLink && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              form.clearErrors()
              setUsePassword((current) => !current)
            }}
          >
            {usePassword ? 'Email me a sign-in link instead' : 'Use my password instead'}
          </Button>
        )}
      </Form>
    </AuthCard>
  )
}

export interface MagicLinkSentProps extends AuthScreenProps {
  email: string
  /** Shows "Use a different email". */
  onBack?: () => void
}

/** "Check your email" after requesting a sign-in link, with a resend timer. */
export function MagicLinkSent({
  email: address,
  onBack,
  title = 'Check your email',
  description,
  headingLevel,
  footer,
  className,
}: MagicLinkSentProps) {
  const { signIn } = useAuth()
  const [cooldown, startCooldown] = useCooldown(30)
  return (
    <AuthNotice
      title={title}
      description={
        description ?? (
          <>
            We sent a sign-in link to <span className="font-medium text-foreground">{address}</span>
            .
          </>
        )
      }
      footer={footer}
      className={className}
      {...(headingLevel && { headingLevel })}
      actions={
        <>
          <Button
            variant="outline"
            disabled={cooldown > 0}
            onClick={async () => {
              startCooldown()
              await signIn({ email: address, magicLink: true }).catch(() => {})
            }}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend link'}
          </Button>
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              Use a different email
            </Button>
          )}
        </>
      }
    >
      The link expires in 15 minutes and works once.
    </AuthNotice>
  )
}
