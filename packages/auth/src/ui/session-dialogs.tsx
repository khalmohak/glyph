import { Alert, Button, Field, Modal, PasswordInput, Text } from '@glyphui/ui'
import { type FormEvent, useEffect, useState } from 'react'
import { isAuthError } from '../core/errors'
import { useAuth } from '../react/provider'

export interface SessionExpiredDialogProps {
  /** Called after the user chooses to sign out instead of signing back in. */
  onSignOut?: () => void
}

/**
 * Opens when the session expires mid-use (an API call returned 401 and refreshing failed).
 * The user signs back in right there, so nothing on the page is lost. Render once, inside
 * `AuthProvider`. For OAuth-only accounts it offers "Sign out" to start over.
 */
export function SessionExpiredDialog({ onSignOut }: SessionExpiredDialogProps) {
  const { expired, user, signIn, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const email = (user as { email?: string } | null)?.email ?? ''

  useEffect(() => {
    if (!expired) {
      setPassword('')
      setError(null)
    }
  }, [expired])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!password) return setError('Enter your password.')
    setBusy(true)
    setError(null)
    try {
      const result = await signIn({ email, password })
      if (result.status !== 'signed-in') setError('Finish signing in on the sign-in page.')
    } catch (caught) {
      setError(isAuthError(caught) ? caught.message : 'Sign-in failed. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={expired}
      // Only the buttons close it: the user must sign in again or sign out.
      onOpenChange={() => {}}
      onEscapeKeyDown={(event) => event.preventDefault()}
      closeOnOverlayClick={false}
      showClose={false}
      size="sm"
      title="Your session expired"
      description={`Sign in again as ${email} to keep working. Nothing on this page was lost.`}
      onSubmit={submit}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              await signOut({ reason: 'expired' })
              onSignOut?.()
            }}
          >
            Sign out
          </Button>
          <Button type="submit" loading={busy}>
            Sign in
          </Button>
        </>
      }
    >
      <div className="grid gap-3">
        {error && (
          <Alert tone="danger" icon={false}>
            {error}
          </Alert>
        )}
        {/* The username field lets password managers fill the right account. */}
        <input type="email" autoComplete="username" value={email} readOnly hidden />
        <Field label="Password">
          <PasswordInput
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
      </div>
    </Modal>
  )
}

export interface IdleWarningDialogProps {
  /** Called after the user signs out from the dialog. */
  onSignOut?: () => void
}

/**
 * Warns before the idle timeout (`AuthProvider idleTimeout`) signs the user out, with a
 * countdown and "Stay signed in". Render once, inside `AuthProvider`.
 */
export function IdleWarningDialog({ onSignOut }: IdleWarningDialogProps) {
  const { idleDeadline, keepAlive, signOut } = useAuth()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (idleDeadline === null) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [idleDeadline])
  const seconds = idleDeadline === null ? 0 : Math.max(0, Math.ceil((idleDeadline - now) / 1000))

  return (
    <Modal
      open={idleDeadline !== null}
      onOpenChange={(open) => {
        if (!open) keepAlive()
      }}
      size="sm"
      title="Still there?"
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              await signOut({ reason: 'user' })
              onSignOut?.()
            }}
          >
            Sign out
          </Button>
          <Button type="button" onClick={keepAlive}>
            Stay signed in
          </Button>
        </>
      }
    >
      <Text tone="muted">
        For your security, you’ll be signed out in{' '}
        <span className="font-medium tabular-nums text-foreground" aria-live="polite">
          {seconds} {seconds === 1 ? 'second' : 'seconds'}
        </span>
        .
      </Text>
    </Modal>
  )
}
