import { Alert, Button, useComponentConfig } from '@glyphui/ui'
import { useState } from 'react'
import { isAuthError } from '../core/errors'
import type { AuthSession, OAuthProvider } from '../core/types'
import { useAuth } from '../react/provider'
import { socialButtonsStyles } from './auth.styles'
import { providerIcons, providerName } from './provider-icons'

export interface SocialButtonsProps {
  /** Default: every provider the adapter supports. */
  providers?: readonly OAuthProvider[]
  /** `stack` (default) is full-width buttons; `row` puts them side by side, icon and name. */
  layout?: 'stack' | 'row'
  /** Button text. Default "Continue with Google". */
  label?: (name: string) => string
  /** Called after a popup sign-in completes. Redirect flows leave the page instead. */
  onSuccess?: (session: AuthSession) => void
  className?: string
}

/** "Continue with …" buttons for the adapter's OAuth providers. Renders nothing when there are none. */
export function SocialButtons(inProps: SocialButtonsProps) {
  const [props, slots] = useComponentConfig('SocialButtons', inProps)
  const {
    providers,
    layout,
    label = (name: string) => `Continue with ${name}`,
    onSuccess,
    className,
  } = props
  const { capabilities, signIn } = useAuth()
  const [pending, setPending] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const list = providers ?? capabilities.oauthProviders
  if (list.length === 0) return null
  const s = socialButtonsStyles({ layout })

  async function start(provider: OAuthProvider) {
    setPending(provider)
    setError(null)
    try {
      const result = await signIn({ provider })
      if (result.status === 'signed-in') onSuccess?.(result.session)
    } catch (caught) {
      setError(isAuthError(caught) ? caught.message : 'Sign-in failed. Try again.')
    } finally {
      setPending(null)
    }
  }

  return (
    <div data-slot="social-buttons" className={s.root({ class: [slots.root, className] })}>
      {error && (
        <Alert tone="danger" icon={false}>
          {error}
        </Alert>
      )}
      {list.map((provider) => (
        <Button
          key={provider}
          type="button"
          variant="outline"
          fullWidth
          loading={pending === provider}
          disabled={pending !== null && pending !== provider}
          leftIcon={
            providerIcons[provider] ? (
              <span className={s.icon({ class: slots.icon })}>{providerIcons[provider]}</span>
            ) : undefined
          }
          onClick={() => start(provider)}
        >
          {layout === 'row' ? providerName(provider) : label(providerName(provider))}
        </Button>
      ))}
    </div>
  )
}
