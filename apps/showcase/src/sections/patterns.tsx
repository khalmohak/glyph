import { Container, Eyebrow, Heading, Section, Text } from '@glyphkit/ui'
import { AppDemo } from './patterns/app-demo'
import { FormDemo } from './patterns/form-demo'

export function Patterns() {
  return (
    <Section id="patterns" divided>
      <Container className="grid gap-16">
        <div className="grid max-w-2xl gap-3">
          <Eyebrow tone="primary">Patterns</Eyebrow>
          <Heading level={2}>The parts every app rebuilds, already built</Heading>
          <Text tone="muted">
            Forms with schema validation and server errors. Data tables with sorting, search,
            selection and paging. An app layout with a collapsible sidebar and a mobile drawer.
            Loading, empty and error states with one convention.
          </Text>
        </div>
        <FormDemo />
        <AppDemo />
      </Container>
    </Section>
  )
}
