import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'

describe('HoverCard', () => {
  it('renders themed content when open', () => {
    render(
      <HoverCard open>
        <HoverCardTrigger href="/u/ada">@ada</HoverCardTrigger>
        <HoverCardContent>Ada Lovelace · Engineering</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.getByRole('link', { name: '@ada' })).toBeInTheDocument()
    const content = screen.getByText('Ada Lovelace · Engineering')
    expect(content).toHaveAttribute('data-slot', 'hover-card-content')
  })

  it('stays closed until hovered', () => {
    render(
      <HoverCard>
        <HoverCardTrigger href="/u/ada">@ada</HoverCardTrigger>
        <HoverCardContent>Profile</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })
})
