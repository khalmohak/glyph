/**
 * Registers every component with the theme engine so `theme.components` is typed:
 * `components.Button.defaultVariants.size` only accepts 'sm' | 'md' | 'lg', and
 * `components.Card.className` only accepts Card's slot names.
 *
 * Adding a component: add one line here.
 */
import type { avatarStyles } from './components/avatar/avatar.styles'
import type { badgeStyles } from './components/badge/badge.styles'
import type { buttonStyles } from './components/button/button.styles'
import type { cardStyles } from './components/card/card.styles'
import type { checkboxStyles } from './components/checkbox/checkbox'
import type { eyebrowStyles } from './components/eyebrow/eyebrow.styles'
import type { fieldStyles } from './components/field/field.styles'
import type { headingStyles } from './components/heading/heading.styles'
import type { inputStyles } from './components/input/input.styles'
import type { kbdStyles } from './components/kbd/kbd'
import type { labelStyles } from './components/label/label'
import type { segmentedControlStyles } from './components/segmented-control/segmented-control'
import type { selectStyles } from './components/select/select'
import type { separatorStyles } from './components/separator/separator'
import type { skeletonStyles } from './components/skeleton/skeleton'
import type { spinnerStyles } from './components/spinner/spinner.styles'
import type { switchStyles } from './components/switch/switch'
import type { tableStyles } from './components/table/table'
import type { tabsStyles } from './components/tabs/tabs'
import type { textStyles } from './components/text/text.styles'
import type { textareaStyles } from './components/textarea/textarea'
import type { tooltipStyles } from './components/tooltip/tooltip'
import type {
  appShellStyles,
  navbarStyles,
  pageHeaderStyles,
  sidebarStyles,
} from './patterns/app-shell/app-shell.styles'
import type { stateStyles } from './patterns/async/states'
import type { StylesEntry } from './utils/registry'

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    AppShell: StylesEntry<typeof appShellStyles>
    Avatar: StylesEntry<typeof avatarStyles>
    Badge: StylesEntry<typeof badgeStyles>
    Button: StylesEntry<typeof buttonStyles>
    Card: StylesEntry<typeof cardStyles>
    Checkbox: StylesEntry<typeof checkboxStyles>
    EmptyState: StylesEntry<typeof stateStyles>
    Eyebrow: StylesEntry<typeof eyebrowStyles>
    Field: StylesEntry<typeof fieldStyles>
    Heading: StylesEntry<typeof headingStyles>
    Input: StylesEntry<typeof inputStyles>
    Kbd: StylesEntry<typeof kbdStyles>
    Label: StylesEntry<typeof labelStyles>
    Navbar: StylesEntry<typeof navbarStyles>
    PageHeader: StylesEntry<typeof pageHeaderStyles>
    SegmentedControl: StylesEntry<typeof segmentedControlStyles>
    Select: StylesEntry<typeof selectStyles>
    Separator: StylesEntry<typeof separatorStyles>
    Sidebar: StylesEntry<typeof sidebarStyles>
    Skeleton: StylesEntry<typeof skeletonStyles>
    Spinner: StylesEntry<typeof spinnerStyles>
    Switch: StylesEntry<typeof switchStyles>
    Table: StylesEntry<typeof tableStyles>
    Tabs: StylesEntry<typeof tabsStyles>
    Text: StylesEntry<typeof textStyles>
    Textarea: StylesEntry<typeof textareaStyles>
    Tooltip: StylesEntry<typeof tooltipStyles>
  }
}
