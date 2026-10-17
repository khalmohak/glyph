import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Field } from '../field'
import { NumberInput } from './number-input'

describe('NumberInput', () => {
  it('steps with buttons and arrow keys within bounds', async () => {
    const onValueChange = vi.fn()
    render(
      <Field label="Seats">
        <NumberInput defaultValue={2} min={1} max={5} onValueChange={onValueChange} />
      </Field>,
    )
    const input = screen.getByRole('spinbutton', { name: 'Seats' })
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }))
    expect(onValueChange).toHaveBeenLastCalledWith(3)
    await userEvent.click(input)
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}')
    expect(onValueChange).toHaveBeenLastCalledWith(5)
    expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled()
  })

  it('parses typed text and clamps on blur', async () => {
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Amount" max={100} onValueChange={onValueChange} />)
    const input = screen.getByRole('spinbutton', { name: 'Amount' })
    await userEvent.type(input, '250')
    await userEvent.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(100)
    expect(input).toHaveValue('100')
  })

  it('formats when not focused and shows the raw number while editing', async () => {
    render(
      <NumberInput
        aria-label="Price"
        defaultValue={1234.5}
        locale="en-US"
        formatOptions={{ style: 'currency', currency: 'USD' }}
      />,
    )
    const input = screen.getByRole('spinbutton', { name: 'Price' })
    expect(input).toHaveValue('$1,234.50')
    await userEvent.click(input)
    expect(input).toHaveValue('1234.5')
  })

  it('treats an emptied field as null', async () => {
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Qty" defaultValue={3} onValueChange={onValueChange} />)
    const input = screen.getByRole('spinbutton', { name: 'Qty' })
    await userEvent.clear(input)
    await userEvent.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })

  it('parses the locale decimal comma and grouping', async () => {
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Betrag" locale="de-DE" onValueChange={onValueChange} />)
    const input = screen.getByRole('spinbutton', { name: 'Betrag' })
    await userEvent.type(input, '1.234,5')
    await userEvent.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(1234.5)
    await userEvent.clear(input)
    await userEvent.type(input, '0,25')
    await userEvent.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(0.25)
  })

  it('keeps the raw number while focused after stepping', async () => {
    render(
      <NumberInput
        aria-label="Budget"
        defaultValue={1}
        locale="en-US"
        formatOptions={{ style: 'currency', currency: 'USD' }}
      />,
    )
    const input = screen.getByRole('spinbutton', { name: 'Budget' })
    expect(input).toHaveValue('$1.00')
    await userEvent.click(input)
    await userEvent.keyboard('{ArrowUp}')
    expect(input).toHaveValue('2')
    await userEvent.keyboard('5')
    await userEvent.tab()
    expect(input).toHaveValue('$25.00')
  })

  it('does not report a change when blurred without editing', async () => {
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Seats" defaultValue={3} onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('spinbutton', { name: 'Seats' }))
    await userEvent.tab()
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
