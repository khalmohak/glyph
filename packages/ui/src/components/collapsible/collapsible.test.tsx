import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'

describe('Collapsible', () => {
  it('expands and collapses its content from the trigger', async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Advanced options</CollapsibleTrigger>
        <CollapsibleContent>Retry failed webhooks</CollapsibleContent>
      </Collapsible>,
    )
    const trigger = screen.getByRole('button', { name: 'Advanced options' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Retry failed webhooks')).not.toBeInTheDocument()

    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const content = screen.getByText('Retry failed webhooks')
    expect(content).toHaveAttribute('data-slot', 'collapsible-content')
    expect(trigger).toHaveAttribute('aria-controls', content.id)

    await userEvent.click(trigger)
    await waitFor(() => expect(screen.queryByText('Retry failed webhooks')).not.toBeInTheDocument())
  })
})
