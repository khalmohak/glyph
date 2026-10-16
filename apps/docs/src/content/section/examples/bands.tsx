import { Container, Heading, Section, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Section spacing="sm">
        <Container size="md">
          <Heading level={3}>Default band</Heading>
          <Text tone="muted">spacing="sm" for compact pages.</Text>
        </Container>
      </Section>
      <Section spacing="sm" tone="subtle" divided>
        <Container size="md">
          <Heading level={3}>Subtle, divided band</Heading>
          <Text tone="muted">Alternate tones to separate page sections.</Text>
        </Container>
      </Section>
    </div>
  )
}
