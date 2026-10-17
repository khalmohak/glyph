import * as ui from '@glyphui/ui'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ModalClose,
  RadioGroupItem,
  SelectItem,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from '@glyphui/ui'
import { Bold } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import type { Control } from './controls'

/** Any Glyph component, rendered with playground values. */
// biome-ignore lint/suspicious/noExplicitAny: components with different prop types share one registry
export type AnyComponent = ComponentType<any>

export type PlaygroundValues = Record<string, unknown>

export interface RenderContext {
  /** Lets a preview report a change back (e.g. Pagination's page). */
  set: (name: string, value: unknown) => void
}

/**
 * How a component's Playground tab works. Controls are derived from its props and `tv()`
 * variants; a config adds what the preview needs to be meaningful (children, items, a trigger).
 */
export interface PlaygroundConfig {
  /** Export rendered and shown in code. Default: the doc's `propsOf` component. */
  component?: string
  /** Initial values (children text, labels) that differ from the component's defaults. */
  initial?: PlaygroundValues
  /** Only these derived controls, in this order. */
  include?: readonly string[]
  exclude?: readonly string[]
  /** Extra controls, or overrides for derived ones (matched by name). */
  controls?: readonly (Partial<Control> & Pick<Control, 'name'>)[]
  /** Custom preview. Default: `<Component {...values} />` with `children` from values. */
  render?: (values: PlaygroundValues, ctx: RenderContext) => ReactNode
  /** Custom code. Receives the JSX attributes that differ from defaults. */
  code?: (attrs: readonly string[], values: PlaygroundValues) => string
  /** Preview width: content-sized (default) or fill the frame. */
  fill?: boolean
}

const text = (name: string, initial?: string): Partial<Control> & Pick<Control, 'name'> => ({
  name,
  kind: 'text',
  ...(initial !== undefined && { initial }),
})
const bool = (name: string, defaultValue = false) =>
  ({ name, kind: 'boolean', defaultValue }) as const
const num = (name: string, opts: Partial<Control> = {}) =>
  ({ name, kind: 'number', ...opts }) as const

const attrs = (list: readonly string[]) => (list.length ? ` ${list.join(' ')}` : '')
const str = (value: unknown) => (typeof value === 'string' ? value : '')

export const playgrounds: Record<string, PlaygroundConfig> = {
  button: {
    initial: { children: 'Save changes' },
    exclude: ['iconOnly'],
    controls: [text('children'), bool('disabled')],
  },
  badge: { initial: { children: 'Beta' }, controls: [text('children')] },
  avatar: { initial: { name: 'Ada Lovelace' } },
  card: {
    fill: true,
    render: (v) => (
      <Card {...v} className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Team plan</CardTitle>
          <CardDescription>Invite people and share projects.</CardDescription>
        </CardHeader>
        <CardBody>
          <Text size="small" tone="muted">
            Everyone on the team gets the same theme, components and permissions.
          </Text>
        </CardBody>
        <CardFooter className="justify-end">
          <Button size="sm">Invite</Button>
        </CardFooter>
      </Card>
    ),
    code: (a) =>
      `<Card${attrs(a)}>\n  <CardHeader>\n    <CardTitle>Team plan</CardTitle>\n    <CardDescription>Invite people and share projects.</CardDescription>\n  </CardHeader>\n  <CardBody>…</CardBody>\n  <CardFooter>\n    <Button size="sm">Invite</Button>\n  </CardFooter>\n</Card>`,
  },
  alert: {
    fill: true,
    initial: { title: 'Heads up', children: 'Your trial ends in 3 days.' },
    exclude: ['dismissLabel'],
    controls: [text('children')],
  },
  banner: {
    fill: true,
    initial: { children: 'PDF, CSV and media viewers are here.' },
    exclude: ['storageKey', 'dismissLabel'],
    controls: [text('children')],
  },
  input: {
    initial: { placeholder: 'you@company.com' },
    controls: [{ name: 'placeholder', kind: 'string' }, bool('disabled')],
    render: (v) => <ui.Input aria-label="Email" {...v} />,
  },
  textarea: {
    initial: { placeholder: 'What is this project about?' },
    controls: [
      { name: 'placeholder', kind: 'string' },
      num('rows', { min: 2, max: 12 }),
      bool('disabled'),
    ],
    render: (v) => <ui.Textarea aria-label="Description" className="w-80" {...v} />,
  },
  checkbox: {
    controls: [bool('defaultChecked'), bool('disabled')],
    render: (v) => (
      // biome-ignore lint/a11y/noLabelWithoutControl: the Checkbox inside is the control
      <label className="flex items-center gap-2 text-small">
        <ui.Checkbox {...v} />
        Accept the terms
      </label>
    ),
  },
  switch: {
    controls: [bool('defaultChecked'), bool('disabled')],
    render: (v) => (
      // biome-ignore lint/a11y/noLabelWithoutControl: the Switch inside is the control
      <label className="flex items-center gap-2 text-small">
        <ui.Switch {...v} />
        Email me product updates
      </label>
    ),
  },
  slider: {
    initial: { min: 0, max: 100, step: 1 },
    include: ['showValue', 'min', 'max', 'step', 'disabled'],
    controls: [
      num('min', { defaultValue: 0 }),
      num('max', { defaultValue: 100 }),
      num('step', { defaultValue: 1, min: 1 }),
      bool('disabled'),
    ],
    fill: true,
    render: (v) => <ui.Slider aria-label="Volume" defaultValue={40} className="w-72" {...v} />,
  },
  select: {
    initial: { placeholder: 'Choose a region' },
    render: (v) => (
      <ui.Select aria-label="Region" placeholder="Choose a region" className="w-60" {...v}>
        <SelectItem value="us">United States</SelectItem>
        <SelectItem value="eu">Europe (Frankfurt)</SelectItem>
        <SelectItem value="ap">Asia Pacific (Tokyo)</SelectItem>
      </ui.Select>
    ),
    code: (a) =>
      `<Select${attrs(a)}>\n  <SelectItem value="us">United States</SelectItem>\n  <SelectItem value="eu">Europe (Frankfurt)</SelectItem>\n</Select>`,
  },
  'radio-group': {
    render: (v) => (
      <ui.RadioGroup aria-label="Plan" defaultValue="pro" {...v}>
        <RadioGroupItem value="free" label="Free" description="For side projects." />
        <RadioGroupItem value="pro" label="Pro" description="For growing teams." />
        <RadioGroupItem value="team" label="Team" description="SSO and audit logs." />
      </ui.RadioGroup>
    ),
    code: (a) =>
      `<RadioGroup defaultValue="pro"${attrs(a)}>\n  <RadioGroupItem value="free" label="Free" />\n  <RadioGroupItem value="pro" label="Pro" />\n</RadioGroup>`,
  },
  'segmented-control': {
    render: (v) => (
      <ui.SegmentedControl
        aria-label="Billing period"
        defaultValue="monthly"
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
          { value: 'lifetime', label: 'Lifetime' },
        ]}
        {...v}
      />
    ),
    code: (a) =>
      `<SegmentedControl\n  aria-label="Billing period"\n  options={[{ value: 'monthly', label: 'Monthly' }, …]}${a.length ? `\n  ${a.join('\n  ')}` : ''}\n/>`,
  },
  tabs: {
    fill: true,
    render: (v) => (
      <ui.Tabs defaultValue="account" className="w-full max-w-md" {...v}>
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="pt-3 text-small text-muted-foreground">
          Name, email and avatar.
        </TabsContent>
        <TabsContent value="billing" className="pt-3 text-small text-muted-foreground">
          Plan, invoices and payment method.
        </TabsContent>
        <TabsContent value="team" className="pt-3 text-small text-muted-foreground">
          Members and roles.
        </TabsContent>
      </ui.Tabs>
    ),
    code: (a) =>
      `<Tabs defaultValue="account"${attrs(a)}>\n  <TabsList>\n    <TabsTrigger value="account">Account</TabsTrigger>\n    <TabsTrigger value="billing">Billing</TabsTrigger>\n  </TabsList>\n  <TabsContent value="account">…</TabsContent>\n</Tabs>`,
  },
  tooltip: {
    initial: { content: 'Copy to clipboard' },
    controls: [text('content'), num('delayDuration', { min: 0, max: 2000, step: 100 })],
    render: (v) => (
      <ui.Tooltip content={str(v.content)} {...v}>
        <Button variant="outline">Hover or focus me</Button>
      </ui.Tooltip>
    ),
    code: (a) =>
      `<Tooltip${attrs(a)}>\n  <Button variant="outline">Hover or focus me</Button>\n</Tooltip>`,
  },
  progress: {
    fill: true,
    initial: { value: 60, label: 'Uploading' },
    controls: [num('value', { min: 0, max: 100, step: 5 }), text('label')],
    render: (v) => <ui.Progress className="w-72" {...v} />,
  },
  spinner: {},
  kbd: { initial: { children: '⌘K' }, controls: [text('children')] },
  heading: {
    initial: { children: 'Invoices that send themselves', level: 2 },
    controls: [text('children'), num('level', { min: 1, max: 6, defaultValue: 2 })],
  },
  text: {
    fill: true,
    initial: { children: 'Glyph takes its whole look from one typed theme file.' },
    controls: [text('children')],
  },
  eyebrow: { initial: { children: 'Billing' }, controls: [text('children')] },
  link: {
    initial: { href: '#', children: 'Read the docs' },
    controls: [text('children')],
  },
  'stat-card': {
    initial: { label: 'Revenue', value: '$48,210', delta: '12.4%', trend: 'up' },
    include: ['label', 'value', 'delta', 'trend', 'invertTrend', 'variant', 'padding'],
    controls: [
      text('label'),
      text('value'),
      text('delta'),
      { name: 'trend', kind: 'enum', options: ['up', 'down', 'neutral'] },
      bool('invertTrend'),
    ],
    render: (v) => <ui.StatCard className="w-72" label="" value="" {...v} />,
  },
  modal: {
    initial: { title: 'Invite teammates', description: 'They get access to every project.' },
    include: ['title', 'description', 'size', 'closeOnOverlayClick', 'showClose'],
    controls: [
      text('title'),
      text('description'),
      bool('closeOnOverlayClick', true),
      bool('showClose', true),
    ],
    render: (v) => (
      <ui.Modal
        title=""
        trigger={<Button>Open modal</Button>}
        footer={
          <ModalClose asChild>
            <Button>Done</Button>
          </ModalClose>
        }
        {...v}
      >
        <Text size="small" tone="muted">
          The body scrolls when it gets long; the header and footer stay put.
        </Text>
      </ui.Modal>
    ),
    code: (a) =>
      `<Modal\n  trigger={<Button>Open modal</Button>}\n  footer={<ModalClose asChild><Button>Done</Button></ModalClose>}${a.length ? `\n  ${a.join('\n  ')}` : ''}\n>\n  …\n</Modal>`,
  },
  'number-input': {
    initial: { min: 0, max: 100, step: 1 },
    include: ['size', 'min', 'max', 'step', 'hideSteppers'],
    controls: [num('min'), num('max'), num('step', { min: 1 })],
    render: (v) => <ui.NumberInput aria-label="Seats" defaultValue={5} className="w-44" {...v} />,
  },
  'password-input': {
    render: (v) => <ui.PasswordInput aria-label="Password" className="w-72" {...v} />,
  },
  'tag-input': {
    initial: { placeholder: 'Add a tag…' },
    include: ['size', 'placeholder', 'maxTags', 'allowDuplicates', 'disabled'],
    controls: [num('maxTags', { min: 1, max: 10 })],
    render: (v) => (
      <ui.TagInput aria-label="Tags" defaultValue={['design', 'billing']} className="w-80" {...v} />
    ),
  },
  'date-picker': {
    include: ['size', 'placeholder', 'clearable', 'disabled'],
    controls: [text('placeholder')],
    render: (v) => <ui.DatePicker aria-label="Due date" className="w-64" {...v} />,
  },
  pagination: {
    initial: { page: 3, pageCount: 12 },
    controls: [
      num('page', { min: 1 }),
      num('pageCount', { min: 1, max: 50 }),
      num('siblingCount', { min: 0, max: 3 }),
    ],
    render: (v, ctx) => (
      <ui.Pagination
        page={1}
        pageCount={1}
        {...v}
        onPageChange={(p: number) => ctx.set('page', p)}
      />
    ),
  },
  stepper: {
    fill: true,
    initial: { current: 1 },
    include: ['current', 'orientation'],
    controls: [num('current', { min: 0, max: 3 })],
    render: (v) => (
      <ui.Stepper
        className="w-full max-w-xl"
        current={0}
        steps={[
          { title: 'Account', description: 'Email and password' },
          { title: 'Workspace', description: 'Name and URL' },
          { title: 'Invite', description: 'Bring your team' },
        ]}
        {...v}
      />
    ),
    code: (a) =>
      `<Stepper\n  steps={[{ title: 'Account' }, { title: 'Workspace' }, { title: 'Invite' }]}${a.length ? `\n  ${a.join('\n  ')}` : ''}\n/>`,
  },
  toggle: {
    controls: [bool('disabled')],
    render: (v) => (
      <ui.Toggle aria-label="Bold" {...v}>
        <Bold />
      </ui.Toggle>
    ),
    code: (a) => `<Toggle aria-label="Bold"${attrs(a)}>\n  <Bold />\n</Toggle>`,
  },
  'copy-button': {
    initial: { value: 'npm install @glyphui/ui', children: 'Copy install command' },
    controls: [text('children'), { name: 'value', kind: 'string' }],
  },
  accordion: {
    fill: true,
    render: (v) => (
      <Accordion type="single" collapsible defaultValue="a" className="w-full max-w-md" {...v}>
        <AccordionItem value="a">
          <AccordionTrigger>Is there a free plan?</AccordionTrigger>
          <AccordionContent>Yes, Starter is free forever.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
          <AccordionContent>You keep access until the end of the period.</AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
    code: (a) =>
      `<Accordion type="single" collapsible${attrs(a)}>\n  <AccordionItem value="a">\n    <AccordionTrigger>Is there a free plan?</AccordionTrigger>\n    <AccordionContent>…</AccordionContent>\n  </AccordionItem>\n</Accordion>`,
  },
  blockquote: {
    fill: true,
    initial: {
      children: 'We closed the books two days faster the first month.',
      author: 'Priya Raman',
      source: 'Controller, Northwind',
    },
    controls: [text('children'), text('author'), text('source')],
  },
  code: { initial: { children: 'pnpm add @glyphui/ui' }, controls: [text('children')] },
  'input-otp': {
    initial: { length: 6 },
    include: ['length', 'size', 'disabled'],
    controls: [
      num('length', { min: 3, max: 8, defaultValue: 6 }),
      // Its styles are exported as `inputOtpStyles`, which the variant lookup doesn't find.
      { name: 'size', kind: 'enum', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
      bool('disabled'),
    ],
    render: (v) => <ui.InputOTP aria-label="Verification code" {...v} />,
  },
  'file-upload': {
    fill: true,
    initial: { accept: 'image/*,.pdf', maxFiles: 3 },
    include: ['label', 'hint', 'accept', 'multiple', 'maxFiles', 'disabled'],
    controls: [
      text('label'),
      text('hint'),
      num('maxFiles', { min: 1, max: 10 }),
      bool('multiple', true),
      bool('disabled'),
    ],
    render: (v) => <ui.FileUpload className="w-full max-w-md" {...v} />,
  },
  combobox: {
    include: ['size', 'multiple', 'placeholder', 'disabled'],
    controls: [text('placeholder')],
    render: (v) => (
      <ui.Combobox
        aria-label="Framework"
        className="w-64"
        options={[
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue' },
          { value: 'svelte', label: 'Svelte' },
          { value: 'solid', label: 'Solid' },
        ]}
        {...v}
      />
    ),
  },
}

/** Every @glyphui/ui export a playground can render, by name. */
export const componentsByName = ui as unknown as Record<string, unknown>
