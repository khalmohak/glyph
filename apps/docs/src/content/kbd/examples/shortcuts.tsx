import { Kbd, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid gap-2">
      <Text size="small">
        Open the command menu with <Kbd>⌘</Kbd> <Kbd>K</Kbd>
      </Text>
      <Text size="small">
        Save with <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd>
      </Text>
    </div>
  )
}
