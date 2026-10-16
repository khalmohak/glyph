import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FeatureGrid } from './feature-grid'

describe('FeatureGrid', () => {
  it('nests feature headings under the section heading and links cards with href', () => {
    render(
      <FeatureGrid
        title="Features"
        features={[
          { title: 'Fast', description: 'Very.' },
          { title: 'Typed', description: 'End to end.', href: '/typed' },
        ]}
      />,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Features' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Fast' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Typed/ })).toHaveAttribute('href', '/typed')
  })
})
