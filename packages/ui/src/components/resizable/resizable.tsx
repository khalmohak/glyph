import type { ComponentProps } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useComponentConfig } from '../../hooks/use-component-config'
import { resizableStyles } from './resizable.styles'

const s = resizableStyles()

function useSlots() {
  return useComponentConfig('Resizable', {})[1]
}

export type ResizablePanelGroupProps = ComponentProps<typeof PanelGroup>

/**
 * Panels separated by draggable, keyboard-accessible dividers, for editors and split views.
 * Set `direction` to "horizontal" or "vertical"; pass `autoSaveId` to remember sizes.
 */
export function ResizablePanelGroup({ className, ...props }: ResizablePanelGroupProps) {
  const slots = useSlots()
  return (
    <PanelGroup
      data-slot="resizable-group"
      className={s.group({ class: [slots.group, className] })}
      {...props}
    />
  )
}

export type ResizablePanelProps = ComponentProps<typeof Panel>

export function ResizablePanel({ className, ...props }: ResizablePanelProps) {
  const slots = useSlots()
  return (
    <Panel
      data-slot="resizable-panel"
      className={s.panel({ class: [slots.panel, className] })}
      {...props}
    />
  )
}

export interface ResizableHandleProps extends ComponentProps<typeof PanelResizeHandle> {
  /** Show a visible grip on the divider. */
  withHandle?: boolean
}

export function ResizableHandle({ withHandle, className, ...props }: ResizableHandleProps) {
  const slots = useSlots()
  return (
    <PanelResizeHandle
      data-slot="resizable-handle"
      className={s.handle({ class: [slots.handle, className] })}
      {...props}
    >
      {withHandle && (
        <div className={s.grip({ class: slots.grip })} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </div>
      )}
    </PanelResizeHandle>
  )
}
