import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RadioGroup, RadioGroupItem } from './radio-group'

type Plan = 'free' | 'pro' | 'team'

describe('RadioGroup', () => {
  it('labels each option and reports the typed value', async () => {
    const onValueChange = vi.fn<(value: Plan) => void>()
    render(
      <RadioGroup<Plan> aria-label="Plan" defaultValue="free" onValueChange={onValueChange}>
        <RadioGroupItem value="free" label="Free" />
        <RadioGroupItem value="pro" label="Pro" description="For teams shipping weekly" />
        <RadioGroupItem value="team" label="Team" />
      </RadioGroup>,
    )
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked()
    const pro = screen.getByRole('radio', { name: 'Pro' })
    expect(pro).toHaveAccessibleDescription('For teams shipping weekly')
    await userEvent.click(screen.getByText('Pro'))
    expect(pro).toBeChecked()
    expect(onValueChange).toHaveBeenLastCalledWith('pro')
  })

  it('moves selection with arrow keys', async () => {
    render(
      <RadioGroup aria-label="Size" defaultValue="s">
        <RadioGroupItem value="s" label="Small" />
        <RadioGroupItem value="m" label="Medium" />
      </RadioGroup>,
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Small' }))
    await userEvent.keyboard('{ArrowDown}')
    const medium = screen.getByRole('radio', { name: 'Medium' })
    expect(medium).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(medium).toBeChecked()
  })

  it('renders card items as single radios named by their title', async () => {
    render(
      <RadioGroup aria-label="Plan" variant="card">
        <RadioGroupItem value="pro" label="Pro" description="$16 per seat" />
      </RadioGroup>,
    )
    const card = screen.getByRole('radio', { name: /Pro/ })
    expect(card).toHaveAttribute('data-slot', 'radio-group-card')
    await userEvent.click(card)
    expect(card).toBeChecked()
  })
})
