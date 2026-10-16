import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AspectRatio } from './aspect-ratio'

describe('AspectRatio', () => {
  it('reserves space for the ratio and renders its child', () => {
    render(
      <AspectRatio ratio={16 / 9} rounded>
        <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Cover" />
      </AspectRatio>,
    )
    const img = screen.getByRole('img', { name: 'Cover' })
    const box = img.parentElement!
    expect(box).toHaveAttribute('data-slot', 'aspect-ratio')
    expect(box.className).toContain('rounded-lg')
    expect(box.parentElement!.style.paddingBottom).toBe('56.25%')
  })
})
