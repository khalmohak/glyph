import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Progress, ProgressCircle } from './progress'

describe('Progress', () => {
  it('exposes value, max and an accessible name from the label', () => {
    render(<Progress label="Uploading" value={40} showValue />)
    const bar = screen.getByRole('progressbar', { name: 'Uploading' })
    expect(bar).toHaveAttribute('aria-valuenow', '40')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
    expect(bar).toHaveAttribute('aria-valuetext', '40%')
    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('is indeterminate without a value', () => {
    render(<Progress aria-label="Loading" />)
    const bar = screen.getByRole('progressbar', { name: 'Loading' })
    expect(bar).not.toHaveAttribute('aria-valuenow')
    expect(bar).toHaveAttribute('data-state', 'indeterminate')
  })

  it('clamps values above max', () => {
    render(<Progress aria-label="Quota" value={150} max={100} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })
})

describe('ProgressCircle', () => {
  it('reports its value', () => {
    render(<ProgressCircle aria-label="Storage used" value={3} max={4} showValue size="lg" />)
    const ring = screen.getByRole('progressbar', { name: 'Storage used' })
    expect(ring).toHaveAttribute('aria-valuenow', '3')
    expect(ring).toHaveAttribute('aria-valuetext', '75%')
  })
})
