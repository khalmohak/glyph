import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './index'

describe('ContextMenu modality', () => {
  it('does not hide the page from assistive tech while open', async () => {
    render(
      <div>
        <a href="#elsewhere">Elsewhere</a>
        <ContextMenu>
          <ContextMenuTrigger>Right-click here</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Open</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>,
    )
    fireEvent.contextMenu(screen.getByText('Right-click here'))
    expect(await screen.findByRole('menuitem', { name: 'Open' })).toBeInTheDocument()
    expect(document.querySelector('[aria-hidden="true"] a[href="#elsewhere"]')).toBeNull()
  })
})
