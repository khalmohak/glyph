import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'

function Menu({ onRename, onDelete }: { onRename: () => void; onDelete: () => void }) {
  const [pinned, setPinned] = useState(false)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Project</DropdownMenuLabel>
        <DropdownMenuItem shortcut="⌘R" onSelect={onRename}>
          Rename
        </DropdownMenuItem>
        <DropdownMenuCheckboxItem checked={pinned} onCheckedChange={setPinned}>
          Pinned
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger" onSelect={onDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

describe('DropdownMenu', () => {
  it('opens from the keyboard, runs the selected item and closes', async () => {
    const onRename = vi.fn()
    render(<Menu onRename={onRename} onDelete={() => {}} />)
    screen.getByRole('button', { name: 'Actions' }).focus()
    await userEvent.keyboard('{Enter}')
    const menu = screen.getByRole('menu')
    expect(menu).toHaveAttribute('data-slot', 'dropdown-menu-content')
    expect(screen.getByRole('menuitem', { name: /Rename/ })).toHaveTextContent('⌘R')
    await userEvent.click(screen.getByRole('menuitem', { name: /Rename/ }))
    expect(onRename).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })

  it('marks danger items and toggles checkbox items', async () => {
    render(<Menu onRename={() => {}} onDelete={() => {}} />)
    screen.getByRole('button', { name: 'Actions' }).focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute('data-tone', 'danger')
    const pinned = screen.getByRole('menuitemcheckbox', { name: 'Pinned' })
    expect(pinned).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(pinned)
    screen.getByRole('button', { name: 'Actions' }).focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('menuitemcheckbox', { name: 'Pinned' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })
})

describe('DropdownMenuItem asChild', () => {
  it('renders as its child with the icon inside', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild icon={<svg data-testid="icon" />} shortcut="⌘S">
            <a href="/settings">Settings</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const item = await screen.findByRole('menuitem', { name: /Settings/ })
    expect(item.tagName).toBe('A')
    expect(item).toHaveAttribute('href', '/settings')
    expect(item).toContainElement(screen.getByTestId('icon'))
  })
})
