import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Stepper } from './stepper'

const steps = [
  { title: 'Account' },
  { title: 'Workspace' },
  { title: 'Invite team' },
  { title: 'Done' },
]

describe('Stepper', () => {
  it('derives statuses from current and marks the current step', () => {
    render(<Stepper steps={steps} current={1} />)
    const list = screen.getByRole('list', { name: 'Progress' })
    const items = within(list).getAllByRole('listitem')
    expect(items.map((li) => li.getAttribute('data-status'))).toEqual([
      'complete',
      'current',
      'upcoming',
      'upcoming',
    ])
    expect(items[1]).toHaveAttribute('aria-current', 'step')
    expect(items[0]).toHaveTextContent('Account, completed')
  })

  it('lets users go back to completed steps only', async () => {
    const onStepClick = vi.fn()
    render(<Stepper steps={steps} current={2} onStepClick={onStepClick} />)
    expect(screen.getAllByRole('button')).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: /Account/ }))
    expect(onStepClick).toHaveBeenCalledWith(0)
  })

  it('honors an explicit error status', () => {
    render(
      <Stepper
        steps={[{ title: 'Payment', status: 'error' }, { title: 'Confirm' }]}
        current={0}
        orientation="vertical"
      />,
    )
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('data-status', 'error')
    expect(screen.getByRole('list')).toHaveAttribute('data-orientation', 'vertical')
  })
})
