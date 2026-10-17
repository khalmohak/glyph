import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from './avatar'

describe('Avatar', () => {
  it('shows initials from the first and last name', () => {
    render(<Avatar name="  Ada   King Lovelace " />)
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('keeps emoji and other astral characters whole', () => {
    render(<Avatar name="🦊 Fox" />)
    expect(screen.getByText('🦊F')).toBeInTheDocument()
  })
})
