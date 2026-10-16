import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Field } from '../field'
import { InputOTP } from './input-otp'

// input-otp checks for password-manager badges with elementFromPoint, which jsdom lacks.
document.elementFromPoint ??= () => null

describe('InputOTP', () => {
  it('renders one slot per character and reports completion', async () => {
    const onComplete = vi.fn()
    const { container } = render(
      <Field label="Verification code">
        <InputOTP length={4} onComplete={onComplete} />
      </Field>,
    )
    expect(container.querySelectorAll('[data-slot="input-otp-slot"]')).toHaveLength(4)
    const input = screen.getByLabelText('Verification code')
    await userEvent.type(input, '1234')
    expect(onComplete).toHaveBeenCalledWith('1234')
    expect(container.querySelectorAll('[data-slot="input-otp-slot"]')[2]).toHaveTextContent('3')
  })

  it('marks slots invalid when the field has an error', () => {
    const { container } = render(
      <Field label="Code" error="That code expired">
        <InputOTP length={2} />
      </Field>,
    )
    expect(container.querySelector('[data-slot="input-otp-slot"]')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })
})
