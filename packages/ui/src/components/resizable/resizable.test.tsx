import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable'

describe('Resizable', () => {
  it('renders panels with a focusable separator between them', () => {
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={30}>Files</ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>Editor</ResizablePanel>
      </ResizablePanelGroup>,
    )
    const handle = screen.getByRole('separator')
    expect(handle).toHaveAttribute('tabindex', '0')
    expect(handle).toHaveAttribute('data-slot', 'resizable-handle')
    expect(screen.getByText('Files')).toBeInTheDocument()
    expect(screen.getByText('Editor')).toBeInTheDocument()
  })
})
