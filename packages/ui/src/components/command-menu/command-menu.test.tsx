import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandMenu,
  useCommandMenuShortcut,
} from './command-menu'

function Palette({ onNew }: { onNew: () => void }) {
  const [open, setOpen] = useState(false)
  useCommandMenuShortcut(setOpen)
  return (
    <CommandMenu open={open} onOpenChange={setOpen} label="Commands">
      <CommandInput placeholder="Type a command" />
      <CommandList>
        <CommandEmpty>Nothing found</CommandEmpty>
        <CommandGroup heading="Issues">
          <CommandItem onSelect={onNew} shortcut="C">
            New issue
          </CommandItem>
          <CommandItem>Search issues</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandMenu>
  )
}

describe('CommandMenu', () => {
  it('opens with ⌘K, runs the chosen command and closes', async () => {
    const onNew = vi.fn()
    render(<Palette onNew={onNew} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(screen.getByRole('dialog', { name: 'Commands' })).toBeInTheDocument()
    await userEvent.keyboard('new')
    await userEvent.keyboard('{Enter}')
    expect(onNew).toHaveBeenCalledOnce()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the empty state when nothing matches', async () => {
    render(<Palette onNew={() => {}} />)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    await userEvent.keyboard('zzzz')
    expect(screen.getByText('Nothing found')).toBeInTheDocument()
  })
})
