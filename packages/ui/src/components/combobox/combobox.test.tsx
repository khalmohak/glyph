import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Field } from '../field'
import { Combobox } from './combobox'

type Fruit = 'apple' | 'banana' | 'cherry'
const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', keywords: ['yellow'] },
  { value: 'cherry', label: 'Cherry' },
] as const satisfies readonly { value: Fruit; label: string; keywords?: readonly string[] }[]

describe('Combobox', () => {
  it('filters by search and selects with the keyboard', async () => {
    const onValueChange = vi.fn<(value: Fruit | null) => void>()
    render(<Combobox aria-label="Fruit" options={fruits} onValueChange={onValueChange} />)
    const trigger = screen.getByRole('combobox', { name: 'Fruit' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('yel')
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Apple' })).not.toBeInTheDocument()
    await userEvent.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('banana')
    expect(trigger).toHaveTextContent('Banana')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps the list open and collects values in multiple mode', async () => {
    const onValueChange = vi.fn<(value: Fruit[]) => void>()
    render(<Combobox multiple aria-label="Fruits" options={fruits} onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('combobox', { name: 'Fruits' }))
    await userEvent.click(screen.getByRole('option', { name: 'Apple' }))
    await userEvent.click(screen.getByRole('option', { name: 'Cherry' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'cherry'])
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-checked', 'true')
  })

  it('connects to a Field for label and error', () => {
    render(
      <Field label="Fruit" error="Pick one">
        <Combobox options={fruits} />
      </Field>,
    )
    const trigger = screen.getByRole('combobox', { name: 'Fruit' })
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    expect(trigger).toHaveAccessibleDescription('Pick one')
  })
})
