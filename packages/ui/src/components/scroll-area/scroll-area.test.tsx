import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ScrollArea } from './scroll-area'

describe('ScrollArea', () => {
  it('renders its content inside a viewport', () => {
    render(
      <ScrollArea className="h-40" type="always">
        <p>Long content</p>
      </ScrollArea>,
    )
    const content = screen.getByText('Long content')
    expect(content.closest('[data-slot="scroll-area-viewport"]')).not.toBeNull()
    expect(content.closest('[data-slot="scroll-area"]')).toHaveClass('h-40')
  })

  afterEach(() => vi.restoreAllMocks())

  it('is keyboard focusable only when its content overflows', () => {
    const view = () =>
      screen.getByText('Long content').closest('[data-slot="scroll-area-viewport"]')
    const { unmount } = render(
      <ScrollArea className="h-40">
        <p>Long content</p>
      </ScrollArea>,
    )
    expect(view()).not.toHaveAttribute('tabindex')
    unmount()

    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(400)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(160)
    render(
      <ScrollArea className="h-40">
        <p>Long content</p>
      </ScrollArea>,
    )
    expect(view()).toHaveAttribute('tabindex', '0')
  })
})
