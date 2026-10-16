import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'

describe('Sheet', () => {
  it('opens from the requested side as a labelled dialog and closes with Escape', async () => {
    render(
      <Sheet>
        <SheetTrigger>Filters</SheetTrigger>
        <SheetContent side="left" size="lg">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow the list.</SheetDescription>
          </SheetHeader>
          <SheetBody>Body</SheetBody>
        </SheetContent>
      </Sheet>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }))
    const sheet = screen.getByRole('dialog', { name: 'Filters' })
    expect(sheet).toHaveAttribute('data-side', 'left')
    expect(sheet).toHaveAccessibleDescription('Narrow the list.')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('defaults to the right side', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Details</SheetTitle>
        </SheetContent>
      </Sheet>,
    )
    expect(screen.getByRole('dialog', { name: 'Details' })).toHaveAttribute('data-side', 'right')
  })
})
