import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from '../input'
import { Field } from './field'

describe('Field', () => {
  it('connects label, description and error to the control', () => {
    render(
      <Field label="Email" description="We never share it." error="Enter a valid email" required>
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText(/Email/)
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('We never share it. Enter a valid email')
  })

  it('leaves the control valid when there is no error', () => {
    render(
      <Field label="Name">
        <Input />
      </Field>,
    )
    expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-invalid')
  })

  it('keeps a label action out of the control name', () => {
    render(
      <Field label="Password" labelAction={<a href="#reset">Forgot password?</a>}>
        <Input type="password" />
      </Field>,
    )
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toBeInTheDocument()
  })
})
