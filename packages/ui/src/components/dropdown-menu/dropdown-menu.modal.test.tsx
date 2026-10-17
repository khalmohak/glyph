import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './index'

function Menu(props: { modal?: boolean }) {
  return (
    <div>
      <a href="#elsewhere">Elsewhere</a>
      <DropdownMenu {...props}>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

describe('DropdownMenu modality', () => {
  it('does not hide the page from assistive tech while open', async () => {
    render(<Menu />)
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    expect(await screen.findByRole('menuitem', { name: 'Rename' })).toBeInTheDocument()
    // A modal menu sets aria-hidden on the page while links stay focusable (axe aria-hidden-focus).
    expect(document.querySelector('[aria-hidden="true"] a[href="#elsewhere"]')).toBeNull()
  })

  it('can still be made modal', async () => {
    render(<Menu modal />)
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    await screen.findByRole('menuitem', { name: 'Rename' })
    expect(document.querySelector('[aria-hidden="true"] a[href="#elsewhere"]')).not.toBeNull()
  })
})
