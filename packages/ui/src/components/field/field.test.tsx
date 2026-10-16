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
})
