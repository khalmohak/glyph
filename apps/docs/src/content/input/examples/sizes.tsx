import { Input } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid max-w-sm gap-3">
      <Input size="sm" aria-label="Small" placeholder="Small" />
      <Input size="md" aria-label="Medium" placeholder="Medium" />
      <Input size="lg" aria-label="Large" placeholder="Large" />
    </div>
  )
}
