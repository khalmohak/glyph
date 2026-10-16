import { Avatar } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="flex items-center gap-3">
      <Avatar
        name="Grace Hopper"
        src="https://avatars.githubusercontent.com/u/9919?s=96"
        size="lg"
      />
      <Avatar name="Broken Image" src="https://example.invalid/missing.png" size="lg" />
    </div>
  )
}
