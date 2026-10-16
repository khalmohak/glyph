import { Input } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid max-w-sm gap-3">
      <Input aria-label="Project name" placeholder="Project name" />
      <Input aria-label="Disabled" placeholder="Disabled" disabled />
    </div>
  )
}
