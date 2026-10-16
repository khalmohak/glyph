import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'

function Faq(props: { type: 'single' | 'multiple' }) {
  const items = (
    <>
      <AccordionItem value="a">
        <AccordionTrigger>Is it free?</AccordionTrigger>
        <AccordionContent>Yes, MIT licensed.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Does it support dark mode?</AccordionTrigger>
        <AccordionContent>Every theme defines both modes.</AccordionContent>
      </AccordionItem>
    </>
  )
  return props.type === 'single' ? (
    <Accordion type="single" collapsible>
      {items}
    </Accordion>
  ) : (
    <Accordion type="multiple">{items}</Accordion>
  )
}

describe('Accordion', () => {
  it('expands one section at a time in single mode', async () => {
    render(<Faq type="single" />)
    const first = screen.getByRole('button', { name: 'Is it free?' })
    const second = screen.getByRole('button', { name: 'Does it support dark mode?' })
    expect(first).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(first)
    expect(first).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Yes, MIT licensed.')).toBeVisible()
    await userEvent.click(second)
    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(second).toHaveAttribute('aria-expanded', 'true')
  })

  it('keeps several sections open in multiple mode and supports the keyboard', async () => {
    render(<Faq type="multiple" />)
    const first = screen.getByRole('button', { name: 'Is it free?' })
    first.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(first).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Does it support dark mode?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})
