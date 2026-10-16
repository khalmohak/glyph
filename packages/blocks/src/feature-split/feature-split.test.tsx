import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FeatureSplit } from './feature-split'

describe('FeatureSplit', () => {
  it('renders each row with its points and media', () => {
    render(
      <FeatureSplit
        items={[
          { title: 'One', description: 'First', points: ['a', 'b'], media: <img alt="first" /> },
          { title: 'Two', description: 'Second', media: <img alt="second" /> },
        ]}
      />,
    )
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2)
    expect(screen.getByAltText('second')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
  })
})
