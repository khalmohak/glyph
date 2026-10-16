import { Button, Stack, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <Stack direction="row" align="center" justify="between" gap={3} wrap className="max-w-md">
      <Text size="small" tone="muted">
        3 unsaved changes
      </Text>
      <Stack direction="row" gap={2}>
        <Button variant="ghost" size="sm">
          Discard
        </Button>
        <Button size="sm">Save</Button>
      </Stack>
    </Stack>
  )
}
