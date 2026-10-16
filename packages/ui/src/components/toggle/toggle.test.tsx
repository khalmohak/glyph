import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Toggle, ToggleGroup, ToggleGroupItem } from './toggle'

describe('Toggle', () => {
  it('toggles aria-pressed', async () => {
    const onPressedChange = vi.fn()
    render(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange}>
        B
      </Toggle>,
    )
    const toggle = screen.getByRole('button', { name: 'Bold' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(onPressedChange).toHaveBeenCalledWith(true)
  })
})

describe('ToggleGroup', () => {
  it('selects multiple values and passes variant to items', async () => {
    const onValueChange = vi.fn()
    render(
      <ToggleGroup
        type="multiple"
        variant="outline"
        size="sm"
        onValueChange={onValueChange}
        aria-label="Formatting"
      >
        <ToggleGroupItem value="bold" aria-label="Bold">
          B
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          I
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Bold' }))
    await userEvent.click(screen.getByRole('button', { name: 'Italic' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['bold', 'italic'])
    expect(screen.getByRole('button', { name: 'Bold' }).className).toContain('border-border')
  })

  it('in single mode behaves like a radio group', async () => {
    render(
      <ToggleGroup type="single" defaultValue="left" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Left">
          L
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center">
          C
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(screen.getByRole('radio', { name: 'Left' })).toBeChecked()
    await userEvent.click(screen.getByRole('radio', { name: 'Center' }))
    expect(screen.getByRole('radio', { name: 'Center' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Left' })).not.toBeChecked()
  })
})
