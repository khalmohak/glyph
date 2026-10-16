import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Field } from '../field'
import { PasswordInput, passwordStrength } from './password-input'

describe('PasswordInput', () => {
  it('toggles visibility with an accessible button', async () => {
    render(
      <Field label="Password">
        <PasswordInput />
      </Field>,
    )
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
    const toggle = screen.getByRole('button', { name: 'Show password' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(toggle)
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('shows strength as the user types', async () => {
    render(<PasswordInput aria-label="New password" showStrength />)
    const input = screen.getByLabelText('New password')
    await userEvent.type(input, 'abc')
    expect(screen.getByText('Weak')).toBeInTheDocument()
    await userEvent.type(input, 'DEF123!xyz')
    expect(screen.getByText('Strong')).toBeInTheDocument()
  })
})

describe('passwordStrength', () => {
  it('rates by length and variety', () => {
    expect(passwordStrength('short').strength).toBe('weak')
    expect(passwordStrength('longerpassword1').strength).toBe('fair')
    expect(passwordStrength('Longer-password-12').strength).toBe('strong')
  })
})
