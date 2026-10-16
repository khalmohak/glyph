import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  NavigationMenu,
  NavigationMenuCard,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './navigation-menu'

function Example() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Product</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuCard
              href="/components"
              title="Components"
              description="50+ themed parts"
            />
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/pricing" active>
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

describe('NavigationMenu', () => {
  it('renders top-level links through the link component and marks the active page', () => {
    render(<Example />)
    const pricing = screen.getByRole('link', { name: 'Pricing' })
    expect(pricing).toHaveAttribute('href', '/pricing')
    expect(pricing).toHaveAttribute('aria-current', 'page')
  })

  it('opens a panel from its trigger', async () => {
    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Product' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(await screen.findByRole('link', { name: /Components/ })).toHaveAttribute(
      'href',
      '/components',
    )
  })
})
