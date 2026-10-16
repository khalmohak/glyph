import { useState } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { Input, type InputProps } from '../input/input'
import { passwordInputStyles } from './password-input.styles'

export type PasswordStrength = 'weak' | 'fair' | 'strong'

/**
 * A quick strength estimate from length and character variety. A hint for users,
 * not a security check: enforce real rules on the server.
 */
export function passwordStrength(password: string): { score: number; strength: PasswordStrength } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const strength: PasswordStrength = score >= 4 ? 'strong' : score >= 3 ? 'fair' : 'weak'
  return { score, strength }
}

const filled: Record<PasswordStrength, number> = { weak: 1, fair: 2, strong: 3 }
const barColor: Record<PasswordStrength, string> = {
  weak: 'bg-danger',
  fair: 'bg-warning',
  strong: 'bg-success',
}
const labels: Record<PasswordStrength, string> = { weak: 'Weak', fair: 'Fair', strong: 'Strong' }

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'suffix'> {
  /** Show a strength meter under the field once the user starts typing. */
  showStrength?: boolean
  /** Start with the password visible. */
  defaultVisible?: boolean
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {off ? (
        <>
          <path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a13 13 0 0 1-1.7 2.7M6.6 6.6A13.5 13.5 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
          <path d="M9.9 9.9a3 3 0 1 0 4.2 4.2M2 2l20 20" />
        </>
      ) : (
        <>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  )
}

/** A password field with a show/hide toggle and an optional strength meter. */
export function PasswordInput(inProps: PasswordInputProps) {
  const [props, slots] = useComponentConfig('PasswordInput', inProps)
  const {
    showStrength = false,
    defaultVisible = false,
    value,
    defaultValue,
    onChange,
    className,
    ...rest
  } = props
  const [visible, setVisible] = useState(defaultVisible)
  const [typed, setTyped] = useState(String(defaultValue ?? ''))
  const current = value !== undefined ? String(value) : typed
  const { strength } = passwordStrength(current)
  const s = passwordInputStyles({ strength })

  return (
    <div data-slot="password-input" className={s.root({ class: [slots.root, className] })}>
      <Input
        {...rest}
        {...(value !== undefined && { value })}
        {...(defaultValue !== undefined && { defaultValue })}
        type={visible ? 'text' : 'password'}
        autoComplete={rest.autoComplete ?? 'current-password'}
        spellCheck={false}
        onChange={(event) => {
          setTyped(event.target.value)
          onChange?.(event)
        }}
        suffix={
          <button
            type="button"
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            disabled={rest.disabled}
            className={s.toggle({ class: slots.toggle })}
            onClick={() => setVisible((v) => !v)}
          >
            <EyeIcon off={visible} />
          </button>
        }
      />
      {showStrength && current.length > 0 && (
        <div className={s.meter({ class: slots.meter })}>
          <div className={s.bars({ class: slots.bars })} aria-hidden="true">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={s.bar({
                  class: [slots.bar, n <= filled[strength] && barColor[strength]],
                })}
              />
            ))}
          </div>
          <span className={s.label({ class: slots.label })} aria-live="polite">
            {labels[strength]}
          </span>
        </div>
      )}
    </div>
  )
}
