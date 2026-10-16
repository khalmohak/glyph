import { Avatar, AvatarGroup, Text } from '@glyphui/ui'

const team = ['Ada Lovelace', 'Grace Hopper', 'Alan Kay', 'Radia Perlman', 'Ken Thompson']

export default function Example() {
  return (
    <div className="flex items-center gap-3">
      <AvatarGroup>
        {team.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
      <Text size="small" tone="muted">
        5 people on Design
      </Text>
    </div>
  )
}
