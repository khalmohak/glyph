import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'
import { type ConfirmOptions, ConfirmProvider, useConfirm } from './confirm'

function ConfirmButton({ options }: { options: ConfirmOptions }) {
  const confirm = useConfirm()
  const [result, setResult] = useState('none')
  return (
    <>
      <button type="button" onClick={async () => setResult(String(await confirm(options)))}>
        Delete
      </button>
      <output>{result}</output>
    </>
  )
}

const renderConfirm = (options: ConfirmOptions) =>
  render(
    <ConfirmProvider>
      <ConfirmButton options={options} />
    </ConfirmProvider>,
  )

describe('AlertDialog', () => {
  it('renders an alertdialog that focuses Cancel first', async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard draft?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction tone="danger">Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('alertdialog', { name: 'Discard draft?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Keep' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Discard' })).toHaveAttribute(
      'data-variant',
      'danger',
    )
  })
})

describe('useConfirm', () => {
  it('resolves true when confirmed', async () => {
    renderConfirm({ title: 'Delete project?', tone: 'danger' })
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Delete project?' })
    // Danger tone defaults the confirm label to "Delete".
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('true'))
  })

  it('resolves false when cancelled or dismissed with Escape', async () => {
    renderConfirm({ title: 'Archive?', confirmLabel: 'Archive', cancelLabel: 'Not now' })
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await userEvent.click(screen.getByRole('button', { name: 'Not now' }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('false'))

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByRole('alertdialog', { name: 'Archive?' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(screen.getByRole('status')).toHaveTextContent('false')
  })

  it('throws a helpful error outside ConfirmProvider', () => {
    const Bare = () => {
      useConfirm()
      return null
    }
    expect(() => render(<Bare />)).toThrow(/ConfirmProvider/)
  })
})
