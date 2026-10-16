import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Faq } from './faq'

describe('Faq', () => {
  it('expands an answer when its question is clicked', async () => {
    render(<Faq title="FAQ" items={[{ question: 'Is it free?', answer: 'Yes, MIT licensed.' }]} />)
    const trigger = screen.getByRole('button', { name: 'Is it free?' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Yes, MIT licensed.')).toBeVisible()
  })
})
