import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Hero } from './hero'

describe('Hero', () => {
  it('labels the section with an h1 title and renders actions and media', () => {
    render(
      <Hero
        title="Ship faster"
        description="A sentence."
        actions={<a href="/start">Start</a>}
        media={<img alt="Screenshot" />}
      />,
    )
    const heading = screen.getByRole('heading', { level: 1, name: 'Ship faster' })
    expect(screen.getByRole('region', { name: 'Ship faster' })).toContainElement(heading)
    expect(screen.getByRole('link', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByAltText('Screenshot')).toBeInTheDocument()
  })

  it('honors headingLevel', () => {
    render(<Hero title="Title" headingLevel={2} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Title' })).toBeInTheDocument()
  })
})
