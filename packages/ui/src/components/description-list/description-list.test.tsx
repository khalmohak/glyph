import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DescriptionItem, DescriptionList } from './description-list'

describe('DescriptionList', () => {
  it('renders terms and details as a definition list', () => {
    render(
      <DescriptionList layout="inline" dividers>
        <DescriptionItem term="Plan">Pro</DescriptionItem>
        <DescriptionItem term="Seats">12</DescriptionItem>
      </DescriptionList>,
    )
    expect(screen.getByText('Plan').closest('dl')).toHaveAttribute('data-slot', 'description-list')
    const terms = screen.getAllByRole('term')
    expect(terms.map((t) => t.textContent)).toEqual(['Plan', 'Seats'])
    expect(within(terms[0]!.parentElement!).getByRole('definition')).toHaveTextContent('Pro')
  })
})
