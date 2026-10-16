import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LogoCloud } from './logo-cloud'

describe('LogoCloud', () => {
  it('gives named logos an accessible label', () => {
    render(
      <LogoCloud
        title="Trusted by"
        logos={[
          { name: 'Acme', logo: <svg /> },
          { name: 'Globex', logo: <svg /> },
        ]}
      />,
    )
    expect(screen.getByRole('img', { name: 'Acme' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByRole('region', { name: 'Trusted by' })).toBeInTheDocument()
  })
})
