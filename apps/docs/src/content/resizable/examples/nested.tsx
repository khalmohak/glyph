import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@glyphui/ui'

export default function Example() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-64 max-w-xl rounded-lg border border-border font-mono text-caption"
    >
      <ResizablePanel defaultSize={25} className="bg-subtle p-3 text-muted-foreground">
        explorer
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={75}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70} className="p-3">
            editor.tsx
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} className="bg-subtle p-3 text-muted-foreground">
            $ pnpm dev
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
