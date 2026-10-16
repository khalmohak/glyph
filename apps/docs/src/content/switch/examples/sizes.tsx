import { Switch } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="flex items-center gap-4">
      <Switch size="sm" aria-label="Small switch" defaultChecked />
      <Switch size="md" aria-label="Medium switch" defaultChecked />
    </div>
  )
}
