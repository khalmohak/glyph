import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatCard } from './stat-card'

const delta = () => screen.getByText('+4%').closest('[data-slot="badge"]')

describe('StatCard', () => {
  it('renders label, value and delta', () => {
    render(<StatCard label="Revenue" value="$48,210" delta="+4%" trend="up" />)
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('$48,210')).toBeInTheDocument()
    expect(delta()).toHaveAttribute('data-tone', 'success')
  })

  it('treats a rising metric as bad when invertTrend is set', () => {
    render(<StatCard label="Churn" value="2.1%" delta="+4%" trend="up" invertTrend />)
    expect(delta()).toHaveAttribute('data-tone', 'danger')
  })

  it('renders a neutral delta without color', () => {
    render(<StatCard label="Seats" value="12" delta="+4%" />)
    expect(delta()).toHaveAttribute('data-tone', 'neutral')
  })
})
