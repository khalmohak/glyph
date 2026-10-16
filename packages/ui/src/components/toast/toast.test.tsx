import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Toaster, toast } from './toast'

afterEach(() => {
  act(() => toast.dismiss())
})

describe('Toaster', () => {
  it('shows toasts with theme classes instead of sonner styles', async () => {
    render(<Toaster />)
    act(() => {
      toast.success('Project saved', { description: 'All changes are live.' })
    })
    const title = await screen.findByText('Project saved')
    expect(screen.getByText('All changes are live.')).toBeInTheDocument()
    const item = title.closest('[data-sonner-toast]')
    expect(item).not.toBeNull()
    expect(item?.className).toContain('bg-raised')
  })

  it('lets callers add classes through toastOptions.classNames', async () => {
    render(<Toaster toastOptions={{ classNames: { title: 'custom-title' } }} />)
    act(() => {
      toast('Hello')
    })
    expect((await screen.findByText('Hello')).className).toContain('custom-title')
  })
})
