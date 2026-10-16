# @glyphui/blocks

Ready-made page sections for [Glyph](https://github.com/khalmohak/glyph): hero, pricing, FAQ, testimonials, sign-in and more. They are built from `@glyphui/ui` and styled only by your theme, so the same block fits any Glyph theme with no extra CSS.

[Docs](https://khalmohak.github.io/glyph/) · [Blocks](https://khalmohak.github.io/glyph/components?category=Blocks) · [GitHub](https://github.com/khalmohak/glyph)

## Install

```sh
npm install @glyphui/blocks @glyphui/ui
```

Import the styles after Glyph's, so Tailwind generates the classes blocks use:

```css
@import "tailwindcss";
@import "@glyphui/ui/styles.css";
@import "@glyphui/blocks/styles.css";
```

Blocks must render inside `<GlyphProvider>` like any Glyph component.

## Blocks

| Block | What it is |
|---|---|
| `Hero` | Opening section: title, description, actions, optional media (`centered`, `left`, `split`) |
| `LogoCloud` | Muted row of customer or partner logos |
| `FeatureGrid` | Features with icon, title and description in 2–4 columns, optional links |
| `FeatureSplit` | Alternating text and media rows |
| `Stats` | Headline numbers as a description list |
| `Pricing` | Plan comparison with a monthly / yearly switch |
| `Testimonials` | Customer quotes as a grid or with a featured quote |
| `Faq` | Questions and answers in an accordion, stacked or split |
| `Cta` | Closing call to action, as a card or a band |
| `Newsletter` | Email signup with validation, loading, success and error states |
| `SiteFooter` | Footer with link columns, copyright and socials |
| `AuthCard` | Sign-in / sign-up card with a built-in email and password form |
| `SectionHeader` | Eyebrow, title and description for your own sections |

Every block takes its content as typed props, accepts `className` and `id`, labels its section by its title, and lets you set the heading level with `headingLevel`.

## Example

```tsx
import { Cta, Faq, Hero, Pricing, SiteFooter } from '@glyphui/blocks'
import { Button } from '@glyphui/ui'

export function LandingPage() {
  return (
    <>
      <Hero
        title="Invoices that send themselves"
        description="Usage data in, accurate invoices out."
        actions={<Button size="lg">Start free trial</Button>}
      />
      <Pricing
        title="Simple plans"
        tiers={[
          { name: 'Starter', price: 0, features: ['50 invoices a month'], cta: { label: 'Start free', href: '/signup' } },
          {
            name: 'Growth',
            price: { monthly: 49, yearly: 39 },
            features: ['Unlimited invoices', 'Usage-based pricing'],
            cta: { label: 'Start trial', href: '/trial' },
            highlighted: true,
            badge: 'Most popular',
          },
        ]}
      />
      <Faq title="Questions" items={[{ question: 'Can I cancel anytime?', answer: 'Yes.' }]} />
      <Cta title="Ready when you are" actions={<Button>Create an account</Button>} />
      <SiteFooter brand="Ledgerline" copyright="© 2026 Ledgerline, Inc." />
    </>
  )
}
```

Links inside blocks (pricing CTAs, feature cards, footer links) go through the `linkComponent` you pass to `GlyphProvider`, so they use your router.

## License

MIT
