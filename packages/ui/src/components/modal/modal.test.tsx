import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Modal, ModalClose } from './modal'

describe('Modal', () => {
  it('opens from its trigger with title, description, body and footer', async () => {
    render(
      <Modal
        title="Invite teammates"
        description="They get access to every project."
        trigger={<button type="button">Invite</button>}
        footer={
          <ModalClose asChild>
            <button type="button">Done</button>
          </ModalClose>
        }
      >
        <input aria-label="Email" />
      </Modal>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Invite' }))
    const dialog = screen.getByRole('dialog', { name: 'Invite teammates' })
    expect(dialog).toHaveAccessibleDescription('They get access to every project.')
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Done' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('works fully controlled', async () => {
    function Controlled() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <span>{open ? 'open' : 'closed'}</span>
          <Modal open={open} onOpenChange={setOpen} title="Rename" />
        </>
      )
    }
    render(<Controlled />)
    expect(screen.getByRole('dialog', { name: 'Rename' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.getByText('closed')).toBeInTheDocument())
  })
})
