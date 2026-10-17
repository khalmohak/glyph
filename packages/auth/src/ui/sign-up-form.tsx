import { AuthCard } from '@glyphui/blocks'
import { Button, Input, Link, PasswordInput, Text } from '@glyphui/ui'
import { Form, FormError, FormField, FormSubmit, useForm } from '@glyphui/ui/form'
import { type ReactNode, useState } from 'react'
import type { AuthSession, OAuthProvider } from '../core/types'
import { useAuth } from '../react/provider'
import { VerifyEmailForm } from './code-forms'
import { email, fields, minLength, type Rule, required } from './schema'
import { AppLink, AuthNotice, type AuthScreenProps, toFormErrors } from './shared'
import { SocialButtons } from './social-buttons'

export interface SignUpFormProps extends AuthScreenProps {
  /** Called once the account exists and the user is signed in (after the email code). */
  onSuccess?: (session: AuthSession) => void
  /** Adds "Already have an account? Sign in" linking here. */
  signInHref?: string
  /** Ask for the user's name. Default true. */
  collectName?: boolean
  /** Minimum password length. Default 8. */
  minPasswordLength?: number
  /** Shown above the button, e.g. "By signing up you agree to our Terms." */
  terms?: ReactNode
  providers?: readonly OAuthProvider[]
  /**
   * More fields your sign-up needs, such as an invite code or a workspace name. Values are
   * validated with the form and passed to `signUp` as `extra` (the REST adapter sends them in
   * the request body). Server errors keyed by a field's `name` show beside it.
   */
  extraFields?: readonly SignUpExtraField[]
}

export interface SignUpExtraField {
  /** Key in `extra` and in server field errors, e.g. `inviteCode`. */
  name: string
  label: ReactNode
  description?: ReactNode
  /** `true`, or the message to show when it's empty. */
  required?: boolean | string
  placeholder?: string
  autoComplete?: string
  defaultValue?: string
  /** Return a message when the value is invalid. */
  validate?: (value: string) => string | undefined
}

const CORE_FIELDS = ['name', 'email', 'password'] as const

/** Account creation with name, email and password, OAuth buttons, and the email-code step. */
export function SignUpForm({
  onSuccess,
  signInHref,
  collectName = true,
  minPasswordLength = 8,
  terms,
  providers,
  extraFields = [],
  title = 'Create your account',
  description,
  headingLevel,
  footer,
  className,
}: SignUpFormProps) {
  const auth = useAuth()
  const [verifying, setVerifying] = useState<string | null>(null)
  // Extra fields are read once, like the other options: the form's shape can't change later.
  const [extras] = useState(() =>
    extraFields.filter((field) => !(CORE_FIELDS as readonly string[]).includes(field.name)),
  )
  const [schema] = useState(() => {
    const extraRules: Record<string, Rule[]> = {}
    for (const field of extras) {
      const rules: Rule[] = []
      if (field.required)
        rules.push(
          required(typeof field.required === 'string' ? field.required : 'Fill in this field.'),
        )
      if (field.validate) rules.push((value) => field.validate?.(value))
      extraRules[field.name] = rules
    }
    const shape: Record<string, readonly Rule[]> &
      Record<(typeof CORE_FIELDS)[number], readonly Rule[]> = {
      ...extraRules,
      name: collectName ? [required('Enter your name.')] : [],
      email: [required('Enter your email address.'), email()],
      password: [required('Choose a password.'), minLength(minPasswordLength)],
    }
    return fields(shape)
  })
  const form = useForm({
    schema,
    defaultValues: {
      ...Object.fromEntries(extras.map((field) => [field.name, field.defaultValue ?? ''])),
      name: '',
      email: '',
      password: '',
    },
  })
  const shared = { headingLevel, className }

  if (verifying)
    return auth.capabilities.emailCode ? (
      <VerifyEmailForm
        {...shared}
        email={verifying}
        onBack={() => setVerifying(null)}
        {...(onSuccess && { onSuccess })}
      />
    ) : (
      <AuthNotice
        {...shared}
        title="Confirm your email"
        actions={
          signInHref ? (
            <Button variant="outline" asChild>
              <AppLink href={signInHref}>Go to sign in</AppLink>
            </Button>
          ) : undefined
        }
      >
        We sent a link to {verifying}. Open it to activate your account, then sign in.
      </AuthNotice>
    )

  return (
    <AuthCard
      title={title}
      description={description}
      footer={
        footer ??
        (signInHref ? (
          <>
            Already have an account? <Link href={signInHref}>Sign in</Link>
          </>
        ) : undefined)
      }
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
            const result = await auth.signUp({
              email: values.email.trim(),
              password: values.password,
              ...(collectName && { name: values.name.trim() }),
              ...(extras.length > 0 && {
                extra: Object.fromEntries(
                  extras.map((field) => [field.name, (values[field.name] ?? '').trim()]),
                ),
              }),
            })
            if (result.status === 'signed-in') onSuccess?.(result.session)
            else if (result.status === 'needs-verification') setVerifying(result.email)
          } catch (error) {
            return toFormErrors(error, [...CORE_FIELDS, ...extras.map((field) => field.name)])
          }
        }}
      >
        <FormError />
        {collectName && (
          <FormField control={form.control} name="name" label="Name" required>
            {(field) => <Input autoComplete="name" {...field} />}
          </FormField>
        )}
        <FormField control={form.control} name="email" label="Email" required>
          {(field) => (
            <Input
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@company.com"
              {...field}
            />
          )}
        </FormField>
        <FormField
          control={form.control}
          name="password"
          label="Password"
          description={`At least ${minPasswordLength} characters.`}
          required
        >
          {(field) => <PasswordInput autoComplete="new-password" showStrength {...field} />}
        </FormField>
        {extras.map((extra) => (
          <FormField
            key={extra.name}
            control={form.control}
            name={extra.name}
            label={extra.label}
            {...(extra.description !== undefined && { description: extra.description })}
            {...(extra.required && { required: true })}
          >
            {(field) => (
              <Input
                {...(extra.placeholder && { placeholder: extra.placeholder })}
                {...(extra.autoComplete && { autoComplete: extra.autoComplete })}
                {...field}
              />
            )}
          </FormField>
        ))}
        {terms && (
          <Text size="small" tone="muted">
            {terms}
          </Text>
        )}
        <FormSubmit fullWidth>Create account</FormSubmit>
      </Form>
    </AuthCard>
  )
}
