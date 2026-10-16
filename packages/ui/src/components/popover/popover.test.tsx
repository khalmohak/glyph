import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from './popover'

describe('Popover', () => {
  it('toggles from its trigger and closes with Escape or PopoverClose', async () => {
    render(
      <Popover>
        <PopoverTrigger>Share</PopoverTrigger>
        <PopoverContent aria-label="Share options" showArrow>
          <p>Anyone with the link can view.</p>
          <PopoverClose>Done</PopoverClose>
        </PopoverContent>
      </Popover>,
    )
    const trigger = screen.getByRole('button', { name: 'Share' })
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: 'Share options' })).toHaveAttribute(
      'data-slot',
      'popover-content',
    )

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('button', { name: 'Done' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
