import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Calendar } from './calendar'

const month = new Date(2026, 9, 1) // October 2026

describe('Calendar', () => {
  it('renders the month and selects a day', async () => {
    const onSelect = vi.fn()
    render(<Calendar mode="single" defaultMonth={month} onSelect={onSelect} />)
    expect(screen.getByText('October 2026')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /October 14th, 2026/ }))
    expect(onSelect).toHaveBeenCalled()
    expect((onSelect.mock.calls[0]![0] as Date).getDate()).toBe(14)
  })

  it('navigates to the next month', async () => {
    render(<Calendar mode="single" defaultMonth={month} />)
    await userEvent.click(screen.getByRole('button', { name: /next month/i }))
    expect(screen.getByText('November 2026')).toBeInTheDocument()
  })

  it('disables matching dates', () => {
    render(
      <Calendar mode="single" defaultMonth={month} disabled={{ before: new Date(2026, 9, 10) }} />,
    )
    expect(screen.getByRole('button', { name: /October 5th, 2026/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /October 12th, 2026/ })).toBeEnabled()
  })
})
