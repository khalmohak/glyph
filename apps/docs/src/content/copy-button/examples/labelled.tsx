import { CopyButton } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyButton value="npm install @glyphui/ui">Copy install command</CopyButton>
      <CopyButton value="https://glyphui.xyz/" variant="ghost" size="sm" copiedLabel="Link copied">
        Copy link
      </CopyButton>
    </div>
  )
}
