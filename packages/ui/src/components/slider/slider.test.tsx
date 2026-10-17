import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Field } from '../field'
import { Slider } from './slider'

describe('Slider', () => {
  it('takes its accessible name from a surrounding Field label', () => {
    render(
      <Field label="Volume">
        <Slider defaultValue={60} />
      </Field>,
    )
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
  })

  it('exposes a labelled slider and reports a number', () => {
    const onValueChange = vi.fn<(value: number) => void>()
    render(<Slider aria-label="Volume" defaultValue={40} onValueChange={onValueChange} />)
    const thumb = screen.getByRole('slider', { name: 'Volume' })
    thumb.focus()
    expect(thumb).toHaveAttribute('aria-valuenow', '40')
    expect(thumb).toHaveAttribute('aria-valuemin', '0')
    expect(thumb).toHaveAttribute('aria-valuemax', '100')
    fireEvent.keyDown(thumb, { key: 'ArrowRight' })
    expect(onValueChange).toHaveBeenLastCalledWith(41)
  })

  it('renders two named thumbs for a range and reports a tuple', () => {
    const onValueChange = vi.fn<(value: readonly [number, number]) => void>()
    render(
      <Slider<readonly [number, number]>
        defaultValue={[20, 80]}
        step={5}
        onValueChange={onValueChange}
        thumbLabels={['Min price', 'Max price']}
      />,
    )
    const max = screen.getByRole('slider', { name: 'Max price' })
    expect(screen.getByRole('slider', { name: 'Min price' })).toHaveAttribute('aria-valuenow', '20')
    max.focus()
    fireEvent.keyDown(max, { key: 'ArrowLeft' })
    expect(onValueChange).toHaveBeenLastCalledWith([20, 75])
  })

  it('shows formatted values and marks', () => {
    render(
      <Slider
        aria-label="Price"
        defaultValue={30}
        showValue={(v) => `$${v}`}
        marks={[0, { value: 100, label: 'Max' }]}
      />,
    )
    expect(screen.getByText('$30')).toBeInTheDocument()
    expect(screen.getByText('Max')).toBeInTheDocument()
  })
})
