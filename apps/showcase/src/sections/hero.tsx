import {
  Badge,
  Button,
  Container,
  cn,
  Eyebrow,
  Heading,
  Section,
  Text,
  ThemeScope,
  useColorMode,
} from '@glyphui/ui'
import { ArrowRight } from 'lucide-react'
import { useThemeChoice } from '../app'
import { CodeBlock } from '../components/code-block'
import { CopyButton } from '../components/copy-button'
import { themeOptions, themes } from '../glyph.theme'

const themeFile = `
import { defineTheme, presets } from '@glyphui/ui'

export default defineTheme({
  name: 'acme',
  extends: presets.glyph,           // start from any preset
  colors: { dark: { primary: 'oklch(70% 0.19 45)' } },
  radius: { md: '6px', lg: '10px' },
  components: {
    Button: { defaultVariants: { size: 'lg' } },  // typed: 'sm' | 'md' | 'lg'
  },
})
`

export function Hero() {
  const { theme, setTheme } = useThemeChoice()
  const { resolvedMode } = useColorMode()

  return (
    <Section id="overview" spacing="lg" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 h-[32rem] bg-[radial-gradient(50%_50%_at_50%_40%,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent)]"
      />
      <Container className="relative grid gap-14">
        <div className="grid max-w-3xl gap-6">
          <Badge tone="primary" dot className="w-fit">
            v0.1 · Preview
          </Badge>
          <Heading level={1} size="display">
            One theme file. Every screen follows.
          </Heading>
          <Text size="lead" tone="muted" className="max-w-2xl">
            Glyph is a React component library on Tailwind CSS. Color, type, shape, depth and motion
            come from one typed theme. Forms, data tables, app layouts and loading states come
            already solved.
          </Text>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" rightIcon={<ArrowRight />} asChild>
              <a href="#patterns">See the patterns</a>
            </Button>
            <CopyButton
              size="lg"
              variant="outline"
              text="pnpm add @glyphui/ui"
              className="font-mono"
            >
              pnpm add @glyphui/ui
            </CopyButton>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Eyebrow>Same components, four theme files</Eyebrow>
            <Text size="small" tone="faint">
              Pick one. The whole page restyles.
            </Text>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {themeOptions.map((option) => (
              <ThemeCard
                key={option.value}
                selected={theme === option.value}
                onSelect={() => setTheme(option.value)}
                option={option}
                mode={resolvedMode}
              />
            ))}
          </div>
        </div>

        <CodeBlock title="glyph.theme.ts" code={themeFile} className="max-w-3xl" />
      </Container>
    </Section>
  )
}

function ThemeCard({
  option,
  selected,
  onSelect,
  mode,
}: {
  option: (typeof themeOptions)[number]
  selected: boolean
  onSelect: () => void
  mode: 'light' | 'dark'
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group cursor-pointer rounded-lg text-left outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
          : 'hover:-translate-y-0.5',
      )}
    >
      <ThemeScope
        theme={themes[option.value]}
        mode={mode}
        className="pointer-events-none grid h-full gap-4 rounded-lg border-(length:--glyph-border-width) border-border p-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-h4">{option.label}</span>
          <Badge tone="primary" variant="soft">
            Aa
          </Badge>
        </div>
        <span className="text-small text-muted-foreground">{option.blurb}</span>
        <span className="flex items-center gap-2" aria-hidden="true">
          <Button size="sm" tabIndex={-1}>
            Primary
          </Button>
          <Button size="sm" variant="outline" tabIndex={-1}>
            Outline
          </Button>
        </span>
      </ThemeScope>
    </button>
  )
}
