import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pricing } from './pricing'

const tiers = [
  {
    name: 'Free',
    price: 0,
    features: ['3 projects'],
    cta: { label: 'Start free', href: '/signup' },
  },
  {
    name: 'Pro',
    price: { monthly: 20, yearly: 16 },
    features: ['Unlimited projects'],
    cta: { label: 'Start trial', onClick: vi.fn() },
    highlighted: true,
    badge: 'Most popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: ['SSO'],
    cta: { label: 'Contact sales', href: '/sales' },
  },
]

describe('Pricing', () => {
  it('switches prices with the billing control', async () => {
    render(<Pricing title="Plans" tiers={tiers} />)
    const pro = screen
      .getByRole('heading', { name: 'Pro' })
      .closest('[data-slot=card]') as HTMLElement
    expect(pro).toHaveTextContent('$20')
    await userEvent.click(screen.getByRole('radio', { name: 'Yearly' }))
    expect(pro).toHaveTextContent('$16')
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('renders link and button CTAs', async () => {
    render(<Pricing tiers={tiers} />)
    expect(screen.getByRole('link', { name: 'Start free' })).toHaveAttribute('href', '/signup')
    await userEvent.click(screen.getByRole('button', { name: 'Start trial' }))
    expect(tiers[1]!.cta.onClick).toHaveBeenCalled()
  })
})
