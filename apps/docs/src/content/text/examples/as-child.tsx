import { Text } from '@glyphui/ui'

export default function Example() {
  return (
    <p className="text-body">
      Signed in as{' '}
      <Text asChild weight="semibold">
        <span>ada@acme.dev</span>
      </Text>
      .
    </p>
  )
}
