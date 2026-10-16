import {
  type ColorToken,
  Container,
  cn,
  Eyebrow,
  Heading,
  Section,
  Text,
  type TextToken,
  useColorMode,
  useGlyph,
} from '@glyphui/ui'

const specimens: { token: TextToken; sample: string; className?: string }[] = [
  { token: 'display', sample: 'Ship the details' },
  { token: 'h1', sample: 'Design is how it works' },
  { token: 'h2', sample: 'Type sets the tone of a page' },
  { token: 'h3', sample: 'Cards, navbars and sidebars' },
  { token: 'h4', sample: 'Section heading for dense layouts' },
  { token: 'lead', sample: 'A lead paragraph introduces a page in one or two calm sentences.' },
  {
    token: 'body',
    sample: 'Body text is tuned for long reading: comfortable line height, no tracking.',
  },
  { token: 'small', sample: 'Small text for helper copy, metadata and table cells.' },
  {
    token: 'caption',
    sample: 'CAPTION · LABELS · $48,210.00 · 12.4%',
    className: 'font-mono uppercase',
  },
]

// Literal class names so Tailwind's scanner sees them.
const sizeClass: Record<TextToken, string> = {
  display: 'text-display font-display',
  h1: 'text-h1 font-display',
  h2: 'text-h2 font-display',
  h3: 'text-h3 font-display',
  h4: 'text-h4 font-display',
  lead: 'text-lead',
  body: 'text-body',
  small: 'text-small',
  caption: 'text-caption',
}

const headingTokens = new Set<TextToken>(['display', 'h1', 'h2', 'h3', 'h4'])

const swatches: { token: ColorToken; role: string }[] = [
  { token: 'background', role: 'Page' },
  { token: 'subtle', role: 'Sidebars, bands' },
  { token: 'surface', role: 'Cards' },
  { token: 'muted', role: 'Hover, fills' },
  { token: 'border', role: 'Dividers' },
  { token: 'border-strong', role: 'Hover borders' },
  { token: 'faint-foreground', role: 'Placeholders' },
  { token: 'muted-foreground', role: 'Secondary text' },
  { token: 'foreground', role: 'Text' },
  { token: 'primary', role: 'Actions, focus' },
  { token: 'success', role: 'Positive' },
  { token: 'warning', role: 'Caution' },
  { token: 'danger', role: 'Destructive' },
  { token: 'info', role: 'Neutral status' },
]

function describeSize(size: string): string {
  return size.startsWith('clamp(') ? 'fluid' : size
}

export function Tokens() {
  const { theme } = useGlyph()
  const { resolvedMode } = useColorMode()

  return (
    <Section id="tokens" divided>
      <Container className="grid gap-16">
        <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
          <div className="grid h-fit gap-3 lg:sticky lg:top-24">
            <Eyebrow>Typography</Eyebrow>
            <Heading level={2}>A type scale with opinions</Heading>
            <Text tone="muted">
              Nine named steps. Each carries its own size, line height, tracking and weight, so
              headings stay tight and body text stays readable. Display sizes are fluid.
            </Text>
          </div>
          <ul className="grid min-w-0 divide-y divide-border border-y border-border">
            {specimens.map(({ token, sample, className }) => {
              const step = theme.text[token]
              const Tag = headingTokens.has(token) ? 'span' : 'p'
              return (
                <li key={token} className="grid gap-2 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <div className="font-mono text-caption text-faint-foreground">
                    <span className="text-foreground">{token}</span>
                    <br />
                    {describeSize(step.size)} · {step.weight}
                    <br />
                    {step.tracking}
                  </div>
                  <Tag className={cn('min-w-0 break-words', sizeClass[token], className)}>
                    {sample}
                  </Tag>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
          <div className="grid h-fit gap-3">
            <Eyebrow>Color</Eyebrow>
            <Heading level={2}>Semantic, per mode</Heading>
            <Text tone="muted">
              Components only use these names. Each theme defines every one for light and dark, so
              nothing breaks when you switch.
            </Text>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {swatches.map(({ token, role }) => (
              <li key={token} className="grid min-w-0 gap-2">
                <span
                  className="h-14 rounded-md border-(length:--glyph-border-width) border-border shadow-xs"
                  style={{ background: `var(--glyph-${token})` }}
                />
                <span className="grid min-w-0">
                  <span className="truncate font-mono text-caption text-foreground">{token}</span>
                  <span className="truncate text-caption text-faint-foreground">
                    {role} ·{' '}
                    <span className="font-mono">
                      {theme.colors[resolvedMode][token].replace('oklch', '')}
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  )
}
