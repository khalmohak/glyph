import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Field } from '../field'
import { SegmentedControl } from './segmented-control'

const options = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const

describe('SegmentedControl', () => {
  it('reports the typed value of the chosen option', async () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl
        aria-label="Mode"
        options={options}
        defaultValue="light"
        onValueChange={onValueChange}
      />,
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }))
    expect(onValueChange).toHaveBeenCalledWith('dark')
  })

  it('takes its accessible name and description from a surrounding Field', () => {
    render(
      <Field label="Color mode" description="Applies to this device.">
        <SegmentedControl options={options} defaultValue="light" />
      </Field>,
    )
    const group = screen.getByRole('radiogroup', { name: 'Color mode' })
    expect(group).toHaveAccessibleDescription('Applies to this device.')
  })

  it('warns once in development when it has no label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<SegmentedControl options={options} defaultValue="light" />)
    render(<SegmentedControl options={options} defaultValue="dark" />)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain('SegmentedControl needs a label')
    warn.mockRestore()
  })
})
