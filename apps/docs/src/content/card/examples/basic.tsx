import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Text,
} from '@glyphui/ui'

export default function Example() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Upgrade to Pro</CardTitle>
        <CardDescription>Unlimited projects and priority support.</CardDescription>
      </CardHeader>
      <CardBody>
        <Text size="small" tone="muted">
          You are using 3 of 3 projects on the Free plan.
        </Text>
      </CardBody>
      <CardFooter>
        <Button>Upgrade</Button>
        <Button variant="ghost">Compare plans</Button>
      </CardFooter>
    </Card>
  )
}
