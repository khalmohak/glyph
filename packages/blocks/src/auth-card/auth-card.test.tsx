import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AuthCard } from './auth-card'

describe('AuthCard', () => {
  it('validates fields before submitting', async () => {
    const onSubmit = vi.fn()
    render(<AuthCard title="Sign in" onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits credentials and shows a thrown error', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Wrong email or password.'))
    render(<AuthCard title="Sign in" onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText(/Email/), 'a@b.co')
    await userEvent.type(screen.getByLabelText(/Password/), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.co', password: 'secret' })
    expect(await screen.findByText('Wrong email or password.')).toBeInTheDocument()
  })

  it('renders custom fields instead of the built-in form', () => {
    render(
      <AuthCard title="Join">
        <p>Custom</p>
      </AuthCard>,
    )
    expect(screen.getByText('Custom')).toBeInTheDocument()
    expect(screen.queryByLabelText(/Password/)).not.toBeInTheDocument()
  })

  it('keeps the password hint out of the password field name', () => {
    const { container } = render(
      <AuthCard title="Sign in" passwordHint={<a href="#reset">Forgot password?</a>} />,
    )
    const password = container.querySelector('input[type="password"]')
    expect(password).toHaveAccessibleName('Password')
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toBeInTheDocument()
  })
})
