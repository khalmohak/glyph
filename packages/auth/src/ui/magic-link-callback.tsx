import { Button, LoadingState } from '@glyphui/ui'
import { useEffect, useRef, useState } from 'react'
import { isAuthError } from '../core/errors'
import type { AuthSession, SignInResult } from '../core/types'
import { useAuth } from '../react/provider'
import { TwoFactorForm, VerifyEmailForm } from './code-forms'
import { AppLink, AuthNotice, type AuthScreenProps } from './shared'

export interface MagicLinkCallbackProps extends AuthScreenProps {
  /** The token from the sign-in link. Default: the `param` query parameter of the current URL. */
  token?: string | null
  /** Query parameter that carries the token. Default `token`. */
  param?: string
  /** Called once the user is signed in, e.g. to continue to `?next=`. */
  onSuccess?: (session: AuthSession) => void
  /** Adds "Back to sign in" when the link can't be used. */
  signInHref?: string
}

function tokenFromUrl(param: string): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(param)
}

/**
 * The page a sign-in link opens: exchanges its token for a session, then calls `onSuccess`.
 * Continues to the code step when the account uses two-step sign-in. With React Router:
 * `<MagicLinkCallback onSuccess={useRedirectAfterSignIn()} signInHref="/sign-in" />`.
 */
export function MagicLinkCallback({
  token: tokenProp,
  param = 'token',
  onSuccess,
  signInHref,
  title,
  description,
  headingLevel,
  footer,
  className,
}: MagicLinkCallbackProps) {
  const { completeMagicLink } = useAuth()
  const [token] = useState(() => (tokenProp === undefined ? tokenFromUrl(param) : tokenProp))
  const [result, setResult] = useState<SignInResult | null>(null)
  const [error, setError] = useState<string | null>(
    token ? null : 'This sign-in link is incomplete. Request a new one.',
  )
  // A link token works once: StrictMode's second effect run must not spend it again.
  const started = useRef(false)
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    completeMagicLink(token).then(
      (next) => {
        setResult(next)
        if (next.status === 'signed-in') onSuccessRef.current?.(next.session)
      },
      (caught) =>
        setError(
          isAuthError(caught)
            ? caught.message
            : 'This sign-in link didn’t work. Request a new one.',
        ),
    )
  }, [token, completeMagicLink])

  const shared = { headingLevel, className }
  const back = signInHref ? (
    <Button variant="outline" asChild>
      <AppLink href={signInHref}>Back to sign in</AppLink>
    </Button>
  ) : undefined

  if (error)
    return (
      <AuthNotice
        {...shared}
        title={title ?? 'This link can’t be used'}
        footer={footer}
        actions={back}
      >
        {error}
      </AuthNotice>
    )
  if (result?.status === 'needs-second-factor')
    return (
      <TwoFactorForm
        {...shared}
        method={result.method}
        email={result.email}
        {...(onSuccess && { onSuccess })}
      />
    )
  if (result?.status === 'needs-verification')
    return <VerifyEmailForm {...shared} email={result.email} {...(onSuccess && { onSuccess })} />
  return (
    <LoadingState
      label={
        typeof description === 'string'
          ? description
          : result?.status === 'signed-in'
            ? 'Signed in…'
            : 'Signing you in…'
      }
      className="min-h-48"
    />
  )
}
