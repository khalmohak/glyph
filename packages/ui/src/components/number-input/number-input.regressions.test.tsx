import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NumberInput } from './number-input'

describe('NumberInput regressions', () => {
  it('keeps a keyboard select-all when focus swaps the formatted text for the raw number', () => {
    render(
      <NumberInput
        aria-label="Amount"
        defaultValue={90000}
        locale="en-US"
        formatOptions={{ style: 'currency', currency: 'USD' }}
      />,
    )
    const input = screen.getByRole('spinbutton', { name: 'Amount' }) as HTMLInputElement
    expect(input).toHaveValue('$90,000.00')
    // Browsers select the whole value when tabbing into a field, before focus handlers run.
    input.setSelectionRange(0, input.value.length)
    act(() => input.focus())
    expect(input).toHaveValue('90000')
    // Typing must replace the amount, not append to it ($900,001,250 bug).
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe(5)
  })

  it('selects the raw number on keyboard focus even without a prior selection', async () => {
    render(
      <>
        <button type="button">before</button>
        <NumberInput
          aria-label="Amount"
          defaultValue={90000}
          locale="en-US"
          formatOptions={{ style: 'currency', currency: 'USD' }}
        />
      </>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'before' }))
    await userEvent.tab()
    await userEvent.keyboard('1250')
    await userEvent.tab()
    expect(screen.getByRole('spinbutton', { name: 'Amount' })).toHaveValue('$1,250.00')
  })

  it('reports parsed values while typing, before blur', async () => {
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Amount" onValueChange={onValueChange} />)
    const input = screen.getByRole('spinbutton', { name: 'Amount' })
    await userEvent.click(input)
    await userEvent.keyboard('12')
    // Still focused: validation can clear while the user types, not on mousedown elsewhere.
    expect(input).toHaveFocus()
    expect(onValueChange).toHaveBeenLastCalledWith(12)
    await userEvent.keyboard('{Backspace}{Backspace}')
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })

  it('still clamps and rounds on blur after reporting the typed value', async () => {
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Qty" max={10} onValueChange={onValueChange} />)
    const input = screen.getByRole('spinbutton', { name: 'Qty' })
    await userEvent.type(input, '25')
    expect(onValueChange).toHaveBeenLastCalledWith(25)
    await userEvent.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(10)
    expect(input).toHaveValue('10')
  })

  it('does not rewrite the text on focus when nothing is formatted', async () => {
    render(<NumberInput aria-label="Qty" defaultValue={42} />)
    const input = screen.getByRole('spinbutton', { name: 'Qty' }) as HTMLInputElement
    await userEvent.tab()
    expect(input).toHaveFocus()
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe(2)
  })
})
