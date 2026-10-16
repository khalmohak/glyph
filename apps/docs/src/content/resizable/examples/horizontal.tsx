import { ResizableHandle, ResizablePanel, ResizablePanelGroup, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-56 max-w-xl rounded-lg border border-border"
    >
      <ResizablePanel defaultSize={30} minSize={20} className="bg-subtle p-4">
        <Text size="small" weight="medium">
          Inbox
        </Text>
        <Text size="caption" tone="muted">
          24 conversations
        </Text>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70} minSize={40} className="p-4">
        <Text size="small" weight="medium">
          Re: Q4 roadmap
        </Text>
        <Text size="small" tone="muted">
          Drag the divider or focus it and use the arrow keys.
        </Text>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
