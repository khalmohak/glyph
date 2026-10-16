import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './context-menu'

describe('ContextMenu', () => {
  it('opens on right-click and runs the selected action', async () => {
    const onRename = vi.fn()
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>report.pdf</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onRename} shortcut="F2">
            Rename
          </ContextMenuItem>
          <ContextMenuCheckboxItem checked>Show hidden files</ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuItem tone="danger">Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    fireEvent.contextMenu(screen.getByText('report.pdf'))
    const menu = await screen.findByRole('menu')
    expect(menu).toHaveAttribute('data-slot', 'context-menu-content')
    expect(screen.getByRole('menuitemcheckbox', { name: 'Show hidden files' })).toBeChecked()
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute('data-tone', 'danger')
    await userEvent.click(screen.getByRole('menuitem', { name: /Rename/ }))
    expect(onRename).toHaveBeenCalledOnce()
  })
})
