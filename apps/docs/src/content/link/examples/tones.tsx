import { Link, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid gap-2">
      <Text>
        Read the <Link href="#">theme guide</Link> before you start.
      </Text>
      <Text tone="muted">
        <Link href="#" tone="muted" underline="always">
          Privacy policy
        </Link>{' '}
        ·{' '}
        <Link href="#" tone="default">
          Terms
        </Link>
      </Text>
    </div>
  )
}
