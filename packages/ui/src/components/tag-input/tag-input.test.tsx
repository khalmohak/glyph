import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Field } from '../field'
import { TagInput } from './tag-input'

describe('TagInput', () => {
  it('adds tags with Enter and comma, removes with Backspace', async () => {
    const onValueChange = vi.fn()
    render(
      <Field label="Topics">
        <TagInput onValueChange={onValueChange} />
      </Field>,
    )
    const input = screen.getByLabelText('Topics')
    await userEvent.type(input, 'react{Enter}css,')
    expect(onValueChange).toHaveBeenLastCalledWith(['react', 'css'])
    await userEvent.keyboard('{Backspace}')
    expect(onValueChange).toHaveBeenLastCalledWith(['react'])
  })

  it('removes a tag with its button', async () => {
    const onValueChange = vi.fn()
    render(<TagInput aria-label="Tags" defaultValue={['a', 'b']} onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Remove a' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['b'])
  })

  it('rejects duplicates and invalid tags with a message', async () => {
    render(
      <TagInput
        aria-label="Emails"
        defaultValue={['a@b.co']}
        validate={(tag) => (tag.includes('@') ? true : 'Enter an email address')}
      />,
    )
    const input = screen.getByRole('textbox', { name: 'Emails' })
    await userEvent.type(input, 'nope{Enter}')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter an email address')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    await userEvent.clear(input)
    await userEvent.type(input, 'a@b.co{Enter}')
    expect(screen.getByRole('alert')).toHaveTextContent('already added')
  })

  it('stops at maxTags but keeps focus so the last tag can be removed', async () => {
    const onValueChange = vi.fn()
    render(
      <TagInput
        aria-label="Tags"
        defaultValue={['one']}
        maxTags={2}
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('textbox', { name: 'Tags' })
    await userEvent.type(input, 'two{Enter}')
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('readonly')
    await userEvent.keyboard('three')
    expect(input).toHaveValue('')
    await userEvent.keyboard('{Backspace}')
    expect(onValueChange).toHaveBeenLastCalledWith(['one'])
    expect(input).not.toHaveAttribute('readonly')
  })

  it('does not commit while an IME composition is in progress', () => {
    const onValueChange = vi.fn()
    render(<TagInput aria-label="Tags" onValueChange={onValueChange} />)
    const input = screen.getByRole('textbox', { name: 'Tags' })
    fireEvent.change(input, { target: { value: 'にほ' } })
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
    expect(onValueChange).not.toHaveBeenCalled()
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onValueChange).toHaveBeenLastCalledWith(['にほ'])
  })
})
