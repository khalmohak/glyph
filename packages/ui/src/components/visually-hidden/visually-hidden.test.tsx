import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VisuallyHidden } from './visually-hidden'

describe('VisuallyHidden', () => {
  it('keeps text in the accessibility tree while hiding it visually', () => {
    render(
      <button type="button">
        <svg aria-hidden="true" />
        <VisuallyHidden>Delete project</VisuallyHidden>
      </button>,
    )
    expect(screen.getByRole('button', { name: 'Delete project' })).toBeInTheDocument()
    const hidden = screen.getByText('Delete project')
    expect(hidden).toHaveAttribute('data-slot', 'visually-hidden')
    expect(hidden.style.position).toBe('absolute')
  })
})
