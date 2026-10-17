import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { Input } from '../../components/input'
import { Form, FormError, FormField, FormSubmit, useForm } from './form'

const schema = z.object({
  email: z.email('Enter a valid email'),
})

function SignupForm({ onSubmit }: { onSubmit: (v: { email: string }) => unknown }) {
  const form = useForm({ schema, defaultValues: { email: '' } })
  return (
    <Form form={form} onSubmit={onSubmit as never}>
      <FormError />
      <FormField control={form.control} name="email" label="Email">
        {(field) => <Input {...field} />}
      </FormField>
      <FormSubmit>Sign up</FormSubmit>
    </Form>
  )
}

describe('Form', () => {
  it('shows schema errors and does not submit invalid values', async () => {
    const onSubmit = vi.fn()
    render(<SignupForm onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Email'), 'nope')
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('maps server field errors returned from onSubmit onto fields', async () => {
    render(<SignupForm onSubmit={() => ({ errors: { email: 'Already registered' } })} />)
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.co')
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(await screen.findByText('Already registered')).toBeInTheDocument()
  })

  it('shows a form-level error when onSubmit throws', async () => {
    render(
      <SignupForm
        onSubmit={() => {
          throw new Error('Server unavailable')
        }}
      />,
    )
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.co')
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Server unavailable'))
  })

  it('submits from a FormSubmit outside the form when given form={form}', async () => {
    const onSubmit = vi.fn()
    function Outside() {
      const form = useForm({ schema, defaultValues: { email: '' } })
      return (
        <>
          <Form form={form} onSubmit={onSubmit}>
            <FormField control={form.control} name="email" label="Email">
              {(field) => <Input {...field} />}
            </FormField>
          </Form>
          <footer>
            <FormSubmit form={form}>Save</FormSubmit>
          </footer>
        </>
      )
    }
    render(<Outside />)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    await userEvent.type(screen.getByLabelText('Email'), 'a@b.co')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.co' }))
  })

  it('explains how to fix a FormSubmit with no form', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<FormSubmit>Save</FormSubmit>)).toThrow(
      /FormSubmit must be inside <Form> or receive form=\{form\}/,
    )
    vi.mocked(console.error).mockRestore()
  })
})
