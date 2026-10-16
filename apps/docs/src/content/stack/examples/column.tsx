import { Heading, Stack, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <Stack gap={2} className="max-w-md">
      <Heading level={3}>Invite your team</Heading>
      <Text tone="muted">Everyone you invite joins as a member. You can change roles later.</Text>
    </Stack>
  )
}
