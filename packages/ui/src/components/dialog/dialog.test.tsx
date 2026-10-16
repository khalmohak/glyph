import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

function Example() {
  return (
    <Dialog>
      <DialogTrigger>Edit profile</DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Changes are saved when you click Save.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <input aria-label="Name" />
        </DialogBody>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog', () => {
  it('opens as a labelled, described modal and moves focus inside', async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole('button', { name: 'Edit profile' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit profile' })
    expect(dialog).toHaveAccessibleDescription('Changes are saved when you click Save.')
    expect(dialog).toHaveAttribute('data-slot', 'dialog-content')
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('closes with Escape, the close button, and DialogClose, returning focus to the trigger', async () => {
    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Edit profile' })

    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()

    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
