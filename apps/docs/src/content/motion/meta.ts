import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Motion',
  slug: 'motion',
  category: 'Patterns',
  status: 'beta',
  description:
    'Animation on by default and controlled from the theme: overlays spring out of their triggers, active indicators slide, lists animate, and sections reveal on scroll.',
  entry: '@glyphui/ui',
  exports: [
    'Reveal',
    'Stagger',
    'StaggerItem',
    'AnimatedNumber',
    'PageTransition',
    'Presence',
    'ActiveIndicator',
    'm',
    'useMotionSettings',
  ],
  source: 'motion/reveal.tsx',
  propsOf: 'Reveal',
  examples: [
    {
      file: 'levels',
      title: 'Motion levels',
      description:
        'The same components at each level. `subtle` is the default; `expressive` travels further and bounces with a soft spring; `none` renders everything instantly.',
    },
    {
      file: 'reveal',
      title: 'Reveal and Stagger',
      description:
        'Entrances on scroll. Every Glyph block uses them, so landing pages come alive with no code.',
    },
    { file: 'animated-number', title: 'AnimatedNumber' },
    {
      file: 'page-transition',
      title: 'Page transitions',
      description:
        'Wrap your router outlet and key it by path. With React Router: <PageTransition transitionKey={useLocation().pathname}><Outlet /></PageTransition>.',
    },
    {
      file: 'presence',
      title: 'Custom enter and exit',
      description: 'Presence and m.* elements from motion, sharing the theme’s spring.',
    },
  ],
  notes: [
    'StaggerItem orders itself by document order when you leave out index; pass index only to override the cascade.',
    'Set theme.motion.level to none, subtle or expressive, and theme.motion.spring to { stiffness, damping, mass? } — overlays, indicators and reveals all follow it. Brutalist snaps with no bounce; Playful is expressive.',
    'GlyphProvider motion="none" overrides the theme for the whole app, e.g. in tests or from a user setting. Visitors who ask their system for reduced motion never get animation.',
    'The spring is compiled to a CSS linear() easing (--glyph-ease-spring, with --glyph-duration-spring), so plain CSS can use it: ease-spring duration-(--glyph-duration-spring).',
    'Content never depends on JavaScript to become visible: server HTML, tests and reduced-motion visitors see it immediately; only browsers that can animate it hide it first.',
    'The motion library loads its animation features lazily on first render; Button and other CSS-only components never import it.',
    'Blocks animate by default; pass animate={false} to any block to turn its entrance off.',
  ],
})
