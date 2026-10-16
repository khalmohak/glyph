import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Field } from '../field'
import { DatePicker, DateRangePicker } from './date-picker'

describe('DatePicker', () => {
  it('opens a calendar, selects a date and shows it formatted', async () => {
    const onValueChange = vi.fn()
    render(
      <Field label="Start date">
        <DatePicker defaultValue={new Date(2026, 9, 1)} onValueChange={onValueChange} />
      </Field>,
    )
    const trigger = screen.getByRole('button', { name: /Start date/ })
    expect(trigger).toHaveTextContent('Oct 1, 2026')
    await userEvent.click(trigger)
    await userEvent.click(await screen.findByRole('button', { name: /October 20th, 2026/ }))
    expect((onValueChange.mock.calls.at(-1)![0] as Date).getDate()).toBe(20)
    expect(screen.getByRole('button', { name: /Start date/ })).toHaveTextContent('Oct 20, 2026')
  })

  it('clears the value', async () => {
    const onValueChange = vi.fn()
    render(
      <DatePicker
        aria-label="Due"
        clearable
        defaultValue={new Date(2026, 0, 5)}
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Clear date' }))
    expect(onValueChange).toHaveBeenLastCalledWith(undefined)
    expect(screen.getByRole('button', { name: 'Due' })).toHaveTextContent('Pick a date')
  })

  it('submits an ISO date with a native form', () => {
    const { container } = render(
      <DatePicker aria-label="Due" name="due" defaultValue={new Date(2026, 2, 9)} />,
    )
    expect(container.querySelector('input[name="due"]')).toHaveValue('2026-03-09')
  })
})

describe('DateRangePicker', () => {
  it('applies a preset', async () => {
    const range = { from: new Date(2026, 9, 1), to: new Date(2026, 9, 7) }
    const onValueChange = vi.fn()
    render(
      <DateRangePicker
        aria-label="Period"
        presets={[{ label: 'First week', range: () => range }]}
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Period' }))
    await userEvent.click(await screen.findByRole('button', { name: 'First week' }))
    expect(onValueChange).toHaveBeenLastCalledWith(range)
    expect(screen.getByRole('button', { name: 'Period' })).toHaveTextContent(
      'Oct 1, 2026 – Oct 7, 2026',
    )
  })
})
