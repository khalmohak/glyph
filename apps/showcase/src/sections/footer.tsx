import { Container, Text } from '@glyphui/ui'
import { LogoMark } from '../components/logo'

export function Footer() {
  return (
    <footer className="border-t-(length:--glyph-border-width) border-border">
      <Container className="flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <LogoMark className="size-4" />
          <Text size="small" tone="muted">
            Glyph · MIT licensed · Built with Glyph
          </Text>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-5 gap-y-2 text-small text-muted-foreground"
        >
          {['Overview', 'Tokens', 'Components', 'Patterns'].map((label) => (
            <a key={label} href={`#${label.toLowerCase()}`} className="hover:text-foreground">
              {label}
            </a>
          ))}
        </nav>
        <Text size="caption" tone="faint" mono>
          v0.1.0-preview
        </Text>
      </Container>
    </footer>
  )
}
