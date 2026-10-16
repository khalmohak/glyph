import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
})
