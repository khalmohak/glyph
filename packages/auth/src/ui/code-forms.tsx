import { AuthCard } from '@glyphui/blocks'
import { Button, InputOTP, REGEXP_ONLY_DIGITS, Text } from '@glyphui/ui'
import { Form, FormError, FormField, FormSubmit, useForm } from '@glyphui/ui/form'
import { useRef } from 'react'
import type { AuthSession } from '../core/types'
import { useAuth } from '../react/provider'
import { digits, fields, required } from './schema'
import { type AuthScreenProps, toFormErrors, useCooldown } from './shared'

const CODE_LENGTH = 6
const RESEND_SECONDS = 30
const codeSchema = fields({
  code: [required('Enter the code from the email.'), digits(CODE_LENGTH)],
})

function CodeField({
  form,
  label,
  onComplete,
}: {
  form: ReturnType<typeof useForm<typeof codeSchema>>
  label: string
  onComplete: () => void
}) {
  return (
    <FormField control={form.control} name="code" label={label}>
      {(field) => (
        <InputOTP
          length={CODE_LENGTH}
          pattern={REGEXP_ONLY_DIGITS}
          autoFocus
          value={field.value ?? ''}
          onChange={(value) => {
            field.onChange(value)
            // Submit as soon as the last digit arrives, as people expect from code inputs.
            if (value.length === CODE_LENGTH) onComplete()
          }}
          onBlur={field.onBlur}
          name={field.name}
          containerClassName="justify-center"
        />
      )}
    </FormField>
  )
}

export interface VerifyEmailFormProps extends AuthScreenProps {
  /** The address the code was sent to. */
  email: string
  onSuccess?: (session: AuthSession) => void
  /** Shows a "Use a different email" button. */
  onBack?: () => void
}

/** "Check your email": a 6-digit code input that submits itself, with a resend timer. */
export function VerifyEmailForm({
  email,
  onSuccess,
  onBack,
  title = 'Check your email',
  description,
  headingLevel,
  footer,
  className,
}: VerifyEmailFormProps) {
  const { verifyEmail, resendVerification } = useAuth()
  const form = useForm({ schema: codeSchema, defaultValues: { code: '' } })
  const formRef = useRef<HTMLFormElement>(null)
  const [cooldown, startCooldown] = useCooldown(RESEND_SECONDS)

  return (
    <AuthCard
      title={title}
      description={
        description ?? (
          <>
            We sent a {CODE_LENGTH}-digit code to{' '}
            <span className="font-medium text-foreground">{email}</span>.
          </>
        )
      }
      footer={footer}
      className={className}
      {...(headingLevel && { headingLevel })}
    >
      <Form
        ref={formRef}
        form={form}
        className="grid gap-4"
        onSubmit={async ({ code }) => {
          try {
            const result = await verifyEmail({ email, code })
            if (result.status === 'signed-in') onSuccess?.(result.session)
          } catch (error) {
            form.setValue('code', '')
            return toFormErrors(error, ['code'])
          }
        }}
      >
        <FormError />
        <CodeField
          form={form}
          label="Verification code"
          onComplete={() => formRef.current?.requestSubmit()}
        />
        <FormSubmit fullWidth>Verify email</FormSubmit>
        <div className="grid gap-1 text-center">
          <Text size="small" tone="muted">
            Didn’t get it? Check your spam folder or{' '}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0"
              disabled={cooldown > 0}
              onClick={async () => {
                startCooldown()
                await resendVerification(email).catch(() => {})
              }}
            >
              {cooldown > 0 ? `resend in ${cooldown}s` : 'resend the code'}
            </Button>
            .
          </Text>
          {onBack && (
            <Button type="button" variant="ghost" size="sm" onClick={onBack}>
              Use a different email
            </Button>
          )}
        </div>
      </Form>
    </AuthCard>
  )
}

export interface TwoFactorFormProps extends AuthScreenProps {
  onSuccess?: (session: AuthSession) => void
  onBack?: () => void
}

/** The second step of sign-in: a code from an authenticator app (or email, per your backend). */
export function TwoFactorForm({
  onSuccess,
  onBack,
  title = 'Two-step verification',
  description = 'Enter the 6-digit code from your authenticator app.',
  headingLevel,
  footer,
  className,
}: TwoFactorFormProps) {
  const { verifySecondFactor } = useAuth()
  const form = useForm({ schema: codeSchema, defaultValues: { code: '' } })
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <AuthCard
      title={title}
      description={description}
      footer={footer}
      className={className}
      {...(headingLevel && { headingLevel })}
    >
      <Form
        ref={formRef}
        form={form}
        className="grid gap-4"
        onSubmit={async ({ code }) => {
          try {
            const result = await verifySecondFactor({ code })
            if (result.status === 'signed-in') onSuccess?.(result.session)
          } catch (error) {
            form.setValue('code', '')
            return toFormErrors(error, ['code'])
          }
        }}
      >
        <FormError />
        <CodeField
          form={form}
          label="Authentication code"
          onComplete={() => formRef.current?.requestSubmit()}
        />
        <FormSubmit fullWidth>Verify</FormSubmit>
        {onBack && (
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            Back to sign in
          </Button>
        )}
      </Form>
    </AuthCard>
  )
}
