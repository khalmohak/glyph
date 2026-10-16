import { Checkbox, Label } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="remember" />
      <Label htmlFor="remember">Remember this device</Label>
    </div>
  )
}
