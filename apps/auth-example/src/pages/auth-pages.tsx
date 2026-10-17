import { useRedirectAfterSignIn } from '@glyphui/auth/react-router'
import {
  AuthLayout,
  AuthNotice,
  ForgotPasswordForm,
  MagicLinkCallback,
  ResetPasswordForm,
  SignInForm,
  SignUpForm,
} from '@glyphui/auth/ui'
import { Text } from '@glyphui/ui'
import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'

function Frame({ children }: { children: ReactNode }) {
  return (
    <AuthLayout
      brand={
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden="true" /> Ledgerline
        </Link>
      }
      aside={
        <figure className="grid max-w-md gap-4">
          <blockquote className="font-display text-h3 text-balance">
            “We closed the books two days faster the first month.”
          </blockquote>
          <figcaption>
            <Text size="small" tone="muted">
              Priya Raman, Controller at Northwind
            </Text>
          </figcaption>
        </figure>
      }
      footer="This demo runs entirely in your browser."
    >
      {children}
    </AuthLayout>
  )
}

export function SignInPage() {
  const continueToApp = useRedirectAfterSignIn('/app')
  return (
    <Frame>
      <SignInForm
        description="Sign in to your Ledgerline workspace."
        signUpHref="/sign-up"
        forgotPasswordHref="/forgot-password"
        providers={[]}
        onSuccess={continueToApp}
      />
    </Frame>
  )
}

export function SignUpPage() {
  const continueToApp = useRedirectAfterSignIn('/app')
  return (
    <Frame>
      <SignUpForm
        description="Free for 14 days. No credit card required."
        signInHref="/sign-in"
        providers={[]}
        terms="By creating an account you agree to the demo’s imaginary terms."
        extraFields={[
          {
            name: 'workspace',
            label: 'Workspace name',
            placeholder: 'Acme Inc.',
            autoComplete: 'organization',
          },
        ]}
        onSuccess={continueToApp}
      />
    </Frame>
  )
}

export function MagicLinkPage() {
  const continueToApp = useRedirectAfterSignIn('/app')
  return (
    <Frame>
      <MagicLinkCallback signInHref="/sign-in" onSuccess={continueToApp} />
    </Frame>
  )
}

export function ForgotPasswordPage() {
  return (
    <Frame>
      <ForgotPasswordForm signInHref="/sign-in" />
    </Frame>
  )
}

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  return (
    <Frame>
      {token ? (
        <ResetPasswordForm token={token} signInHref="/sign-in" />
      ) : (
        <AuthNotice title="This link is incomplete">
          Open the newest reset email again, or{' '}
          <Link to="/forgot-password">request a new link</Link>.
        </AuthNotice>
      )}
    </Frame>
  )
}
