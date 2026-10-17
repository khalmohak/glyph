import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './index'

describe('TabsContent focus', () => {
  it('shows a focus ring when the panel itself takes keyboard focus', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Views">
          <TabsTrigger value="a">Preview</TabsTrigger>
          <TabsTrigger value="b">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Plain text, nothing focusable inside.</TabsContent>
        <TabsContent value="b">Code</TabsContent>
      </Tabs>,
    )
    const panel = screen.getByRole('tabpanel')
    // Radix makes the panel a Tab stop (right per the ARIA tabs pattern), so it must look focused.
    expect(panel).toHaveAttribute('tabindex', '0')
    expect(panel.className).toMatch(/focus-visible:ring-2/)
    expect(panel.className).toMatch(/focus-visible:ring-ring/)
  })
})
