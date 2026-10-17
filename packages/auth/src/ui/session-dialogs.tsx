import {
  Alert,
  Button,
  Field,
  InputOTP,
  Modal,
  PasswordInput,
  REGEXP_ONLY_DIGITS,
  Text,
} from '@glyphui/ui'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { isAuthError } from '../core/errors'
import type { SecondFactorMethod, SignInResult } from '../core/types'
import { useAuth } from '../react/provider'
import { secondFactorDescription } from './code-forms'

const CODE_LENGTH = 6

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
  const { expired, user, signIn, signOut, verifySecondFactor } = useAuth()
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  // Accounts with two-step sign-in continue to the code here instead of leaving the page.
  const [secondFactor, setSecondFactor] = useState<{
    method?: SecondFactorMethod | undefined
    email?: string | undefined
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const email = (user as { email?: string } | null)?.email ?? ''

  useEffect(() => {
    if (!expired) {
      setPassword('')
      setCode('')
      setSecondFactor(null)
      setError(null)
    }
  }, [expired])

  async function attempt(action: () => Promise<SignInResult>) {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    setError(null)
    try {
      const result = await action()
      if (result.status === 'needs-second-factor')
        setSecondFactor({ method: result.method, email: result.email })
      else if (result.status !== 'signed-in') setError('Finish signing in on the sign-in page.')
    } catch (caught) {
      setError(isAuthError(caught) ? caught.message : 'Sign-in failed. Try again.')
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  function verifyCode(value: string) {
    if (value.length !== CODE_LENGTH) return setError(`Enter the ${CODE_LENGTH}-digit code.`)
    return attempt(async () => {
      try {
        return await verifySecondFactor({ code: value })
      } catch (caught) {
        setCode('')
        throw caught
      }
    })
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (secondFactor) return verifyCode(code)
    if (!password) return setError('Enter your password.')
    return attempt(() => signIn({ email, password }))
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
      description={
        secondFactor
          ? secondFactorDescription(secondFactor.method, secondFactor.email)
          : `Sign in again as ${email} to keep working. Nothing on this page was lost.`
      }
      onSubmit={submit}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              // Signed out locally even if the server is unreachable; the client retries.
              await signOut({ reason: 'expired' }).catch(() => {})
              onSignOut?.()
            }}
          >
            Sign out
          </Button>
          <Button type="submit" loading={busy}>
            {secondFactor ? 'Verify' : 'Sign in'}
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
        {secondFactor ? (
          <Field label="Authentication code">
            <InputOTP
              length={CODE_LENGTH}
              pattern={REGEXP_ONLY_DIGITS}
              autoFocus
              value={code}
              onChange={(value) => {
                setCode(value)
                // Submit as soon as the last digit arrives, like the other code steps.
                if (value.length === CODE_LENGTH) void verifyCode(value)
              }}
              containerClassName="justify-center"
            />
          </Field>
        ) : (
          <>
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
          </>
        )}
      </div>
    </Modal>
  )
}

export interface IdleWarningDialogProps {
  /** Called after the user signs out from the dialog, or the idle timeout signs them out. */
  onSignOut?: () => void
}

/**
 * Warns before the idle timeout (`AuthProvider idleTimeout`) signs the user out, with a
 * countdown and "Stay signed in". Render once, inside `AuthProvider`.
 */
export function IdleWarningDialog({ onSignOut }: IdleWarningDialogProps) {
  const { idleDeadline, keepAlive, signOut, lastSignOut } = useAuth()
  const [now, setNow] = useState(() => Date.now())
  // Report automatic idle sign-outs that happen while this dialog is mounted.
  const [mountedAt] = useState(() => Date.now())
  const onSignOutRef = useRef(onSignOut)
  onSignOutRef.current = onSignOut
  useEffect(() => {
    if (lastSignOut?.reason === 'idle' && lastSignOut.at >= mountedAt) onSignOutRef.current?.()
  }, [lastSignOut, mountedAt])
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
              await signOut({ reason: 'user' }).catch(() => {})
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
