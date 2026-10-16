import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Container,
  Eyebrow,
  Field,
  Heading,
  IconButton,
  Input,
  Kbd,
  Section,
  SegmentedControl,
  Select,
  SelectItem,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Tooltip,
} from '@glyphui/ui'
import { ArrowUpRight, Bell, Check, Globe, Plus, Search, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { Sparkline } from '../components/sparkline'

export function Showcase() {
  return (
    <Section id="components" divided tone="subtle">
      <Container className="grid gap-10">
        <div className="grid max-w-2xl gap-3">
          <Eyebrow>Components</Eyebrow>
          <Heading level={2}>Built on Radix, styled only by tokens</Heading>
          <Text tone="muted">
            Accessible behavior from Radix primitives. Every color, radius, shadow and size below
            comes from the active theme; switch it in the header and watch.
          </Text>
        </div>

        <div className="grid gap-4 md:grid-cols-6 lg:grid-cols-12">
          <Stats />
          <ButtonsCard />
          <BadgesCard />
          <ControlsCard />
          <PricingCard />
        </div>
      </Container>
    </Section>
  )
}

const stats = [
  {
    label: 'Revenue',
    value: '$48,210',
    delta: '+12.4%',
    good: true,
    trend: [12, 14, 13, 17, 16, 19, 18, 22, 21, 25, 27, 30],
  },
  {
    label: 'Active users',
    value: '3,912',
    delta: '+4.1%',
    good: true,
    trend: [30, 28, 31, 29, 33, 32, 34, 33, 36, 35, 38, 39],
  },
  {
    label: 'Churn',
    value: '1.8%',
    delta: '−0.4%',
    good: true,
    trend: [3.1, 3, 2.9, 2.9, 2.6, 2.5, 2.4, 2.3, 2.1, 2, 1.9, 1.8],
  },
]

function Stats() {
  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.label} className="md:col-span-2 lg:col-span-4" padding="sm">
          <div className="flex items-center justify-between gap-2 px-1 pt-1">
            <Text size="small" tone="muted">
              {stat.label}
            </Text>
            <Badge tone={stat.good ? 'success' : 'danger'}>{stat.delta}</Badge>
          </div>
          <p className="px-1 font-display text-h2 tabular-nums">{stat.value}</p>
          <Sparkline values={stat.trend} className="text-primary" />
        </Card>
      ))}
    </>
  )
}

function ButtonsCard() {
  const [saving, setSaving] = useState(false)
  return (
    <Card className="md:col-span-6 lg:col-span-7">
      <CardHeader>
        <CardTitle>Buttons</CardTitle>
        <CardDescription>
          Six variants, three sizes, icons, loading, and asChild for links.
        </CardDescription>
      </CardHeader>
      <CardBody className="grid gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="link" rightIcon={<ArrowUpRight />}>
            Link
          </Button>
        </div>
        <Separator />
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" leftIcon={<Plus />}>
            New
          </Button>
          <Button size="md" variant="outline" leftIcon={<Search />}>
            Search
            <Kbd className="ml-1">⌘K</Kbd>
          </Button>
          <Button size="lg">Large</Button>
          <Tooltip content="Notifications">
            <IconButton icon={<Bell />} aria-label="Notifications" variant="outline" />
          </Tooltip>
          <Tooltip content="Settings">
            <IconButton icon={<Settings2 />} aria-label="Settings" />
          </Tooltip>
          <Button
            variant="secondary"
            loading={saving}
            onClick={() => {
              setSaving(true)
              setTimeout(() => setSaving(false), 1500)
            }}
          >
            {saving ? 'Saving…' : 'Click to save'}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

function BadgesCard() {
  return (
    <Card className="md:col-span-6 lg:col-span-5">
      <CardHeader>
        <CardTitle>Status and people</CardTitle>
        <CardDescription>Badges in six tones, avatars with stable fallback colors.</CardDescription>
      </CardHeader>
      <CardBody className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge dot>Backlog</Badge>
          <Badge tone="info" dot>
            In review
          </Badge>
          <Badge tone="warning" dot>
            In progress
          </Badge>
          <Badge tone="success" dot>
            Done
          </Badge>
          <Badge tone="danger" dot>
            Blocked
          </Badge>
          <Badge tone="primary" variant="solid">
            New
          </Badge>
          <Badge variant="outline">v0.1.0</Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-4">
          <AvatarGroup>
            {['Ada Lovelace', 'Grace Hopper', 'Alan Kay', 'Radia Perlman', 'Ken Thompson'].map(
              (name) => (
                <Avatar key={name} name={name} size="md" />
              ),
            )}
          </AvatarGroup>
          <Text size="small" tone="muted">
            5 people on <span className="text-foreground">Design</span>
          </Text>
        </div>
      </CardBody>
    </Card>
  )
}

type Region = 'us' | 'eu' | 'ap'

function ControlsCard() {
  const [region, setRegion] = useState<Region>('eu')
  return (
    <Card className="md:col-span-6 lg:col-span-7">
      <CardHeader>
        <CardTitle>Form controls</CardTitle>
        <CardDescription>
          Every control wires its label, description and error through Field.
        </CardDescription>
      </CardHeader>
      <Tabs defaultValue="general" variant="pill">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="grid gap-4 sm:grid-cols-2">
          <Field label="Workspace URL" description="Lowercase letters, numbers and dashes.">
            <Input prefix="glyph.app/" defaultValue="acme" />
          </Field>
          <Field label="Region">
            <Select<Region> value={region} onValueChange={setRegion}>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="eu">Europe (Frankfurt)</SelectItem>
              <SelectItem value="ap">Asia Pacific (Tokyo)</SelectItem>
            </Select>
          </Field>
          <Field label="Domain" error="Add a DNS record to verify this domain.">
            <Input prefix={<Globe />} defaultValue="acme.dev" />
          </Field>
          <Field label="Search">
            <Input prefix={<Search />} placeholder="Find a project" suffix={<Kbd>/</Kbd>} />
          </Field>
        </TabsContent>
        <TabsContent value="notifications" className="grid gap-4">
          <Field
            orientation="horizontal"
            label="Product updates"
            description="A short email when we ship."
          >
            <Switch defaultChecked />
          </Field>
          <Field
            orientation="horizontal"
            label="Mentions"
            description="When someone @mentions you."
          >
            <Switch defaultChecked />
          </Field>
          <Field orientation="horizontal" label="Weekly digest">
            <Checkbox />
          </Field>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

type Billing = 'monthly' | 'yearly'

function PricingCard() {
  const [billing, setBilling] = useState<Billing>('yearly')
  const price = billing === 'yearly' ? 16 : 20
  return (
    <Card className="md:col-span-6 lg:col-span-5">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Pro</CardTitle>
          <Badge tone="primary">Most popular</Badge>
        </div>
        <CardDescription>For teams shipping more than one product.</CardDescription>
      </CardHeader>
      <SegmentedControl
        aria-label="Billing period"
        fullWidth
        value={billing}
        onValueChange={setBilling}
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly · save 20%' },
        ]}
      />
      <p className="flex items-baseline gap-1">
        <span className="font-display text-h1 tabular-nums">${price}</span>
        <Text asChild size="small" tone="muted">
          <span>per seat / month</span>
        </Text>
      </p>
      <ul className="grid gap-2 text-small">
        {[
          'Unlimited projects',
          'Theme file per project',
          'Priority support',
          'SSO and audit log',
        ].map((item) => (
          <li key={item} className="flex items-center gap-2">
            <Check className="size-4 text-primary" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
      <CardFooter>
        <Button fullWidth>Start 14-day trial</Button>
      </CardFooter>
    </Card>
  )
}
