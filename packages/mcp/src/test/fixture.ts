import type { Manifest, ManifestComponent } from '../manifest'

const component = (c: Partial<ManifestComponent> & Pick<ManifestComponent, 'name' | 'slug'>) =>
  ({
    category: 'Actions',
    status: 'stable',
    description: '',
    entry: '@glyphui/ui',
    exports: [c.name],
    notes: [],
    props: {},
    examples: [],
    styles: [],
    ...c,
  }) satisfies ManifestComponent

/** A small manifest with one of everything, so tests don't depend on the generated data. */
export const fixture: Manifest = {
  version: '1.2.3',
  site: {
    url: 'https://glyph.test',
    demoUrl: 'https://demo.glyph.test',
    authUrl: 'https://auth.glyph.test',
    repo: 'https://github.com/example/glyph',
  },
  packages: [
    {
      name: '@glyphui/ui',
      version: '1.2.3',
      description: 'Components',
      entries: ['@glyphui/ui', '@glyphui/ui/data-table'],
      stylesheet: '@glyphui/ui/styles.css',
      peers: [
        { name: 'react', range: '>=19', optional: false },
        { name: '@tanstack/react-table', range: '^8.20.0', optional: true },
      ],
    },
    {
      name: '@glyphui/blocks',
      version: '1.2.3',
      description: 'Sections',
      entries: ['@glyphui/blocks'],
      stylesheet: '@glyphui/blocks/styles.css',
      peers: [{ name: '@glyphui/ui', range: '>=1.0.0', optional: false }],
    },
    {
      name: '@glyphui/auth',
      version: '1.2.3',
      description: 'Auth',
      entries: ['@glyphui/auth', '@glyphui/auth/ui'],
      stylesheet: '@glyphui/auth/styles.css',
      peers: [
        { name: '@glyphui/ui', range: '>=1.0.0', optional: false },
        { name: '@glyphui/blocks', range: '>=1.0.0', optional: false },
        { name: '@glyphui/tokens', range: '>=1.0.0', optional: false },
        { name: 'react-router', range: '>=7', optional: true },
      ],
    },
  ],
  components: [
    component({
      name: 'Button',
      slug: 'button',
      description: 'Triggers an action.',
      exports: ['Button', 'IconButton', 'buttonStyles'],
      notes: ['Defaults to type="button".'],
      added: '0.2.0',
      props: {
        Button: [
          { name: 'variant', type: '"primary" | "ghost"', required: false, description: 'Look' },
          { name: 'loading', type: 'boolean', required: false, defaultValue: 'false' },
        ],
        IconButton: [{ name: 'aria-label', type: 'string', required: true, description: 'A | B' }],
      },
      examples: [
        { file: 'variants', title: 'Variants', code: '<Button />', kind: 'example' },
        {
          file: 'loading',
          title: 'Loading',
          description: 'Shows a spinner.',
          code: '<Button loading />',
          kind: 'example',
        },
      ],
      styles: [
        {
          component: 'Button',
          slots: ['base', 'icon'],
          variants: { variant: ['primary', 'ghost'], fullWidth: ['true'] },
          defaultVariants: { variant: 'primary' },
        },
      ],
      a11y: { keyboard: [{ keys: 'Enter or Space', action: 'Activates it.' }], notes: ['Native.'] },
    }),
    component({
      name: 'DataTable',
      slug: 'data-table',
      category: 'Data display',
      status: 'beta',
      entry: '@glyphui/ui/data-table',
      description: 'Search, sorting and pagination, in client or server mode.',
      exports: ['DataTable', 'useDataTable'],
      radix: 'TanStack Table',
      props: {
        DataTable: [
          {
            name: 'rowCount',
            type: 'number',
            required: false,
            description: 'Total rows in server mode.',
          },
          { name: 'exportCsv', type: 'boolean', required: false },
        ],
      },
      examples: [{ file: 'server', title: 'Server mode', code: 'const x = 1', kind: 'snippet' }],
    }),
    component({
      name: 'HeroSection',
      slug: 'hero-section',
      category: 'Blocks',
      entry: '@glyphui/blocks',
      description: 'The top of a landing page.',
    }),
    component({
      name: 'Carousel',
      slug: 'carousel',
      category: 'Data display',
      status: 'planned',
      description: 'Slides.',
    }),
  ],
  guides: [
    {
      slug: 'data-tables',
      title: 'Data tables',
      description: 'Sorting, filters and server mode.',
      section: 'Building apps',
      headings: [{ depth: 2, text: 'Server mode', id: 'server-mode' }],
      markdown:
        '# Data tables\n\nTables for apps.\n\n## Server mode\n\nWith `mode="server"` the table hands pagination to your API.\n\n```tsx\n<DataTable />\n```\n',
    },
    {
      slug: 'theming',
      title: 'Theming',
      description: 'One theme file.',
      section: 'Foundations',
      headings: [{ depth: 2, text: 'Dark mode', id: 'dark-mode' }],
      markdown: '# Theming\n\n## Dark mode\n\nSet colors per mode.\n',
    },
  ],
  changelog: [
    {
      version: '1.2.0',
      entries: [
        { text: 'Added CSV export to DataTable.', packages: ['@glyphui/ui'], kind: 'minor' },
      ],
    },
  ],
  theming: {
    tokens: {
      colors: ['background', 'primary'],
      radius: ['sm', 'md'],
      shadow: ['sm'],
      font: ['sans'],
      text: ['body'],
      control: ['md'],
      duration: ['fast'],
      easing: ['standard'],
      motionLevel: ['none', 'subtle'],
    },
    presets: [
      {
        name: 'glyph',
        description: 'Precise.',
        primary: { light: 'blue', dark: 'lightblue' },
        fonts: { sans: '"Geist Variable", sans-serif', display: '', mono: '' },
        radius: { md: '8px' },
        motionLevel: 'subtle',
        recipes: [],
      },
      {
        name: 'brutalist',
        description: 'Loud.',
        primary: { light: 'red', dark: 'yellow' },
        fonts: { sans: 'Archivo', display: '', mono: '' },
        radius: {},
        recipes: ['Button'],
      },
    ],
  },
}
