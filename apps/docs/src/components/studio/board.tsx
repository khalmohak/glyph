import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  type ColorMode,
  Field,
  Input,
  Kbd,
  Modal,
  ModalClose,
  Navbar,
  Progress,
  Select,
  SelectItem,
  StatCard,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  type Theme,
  ThemeScope,
  type Tone,
} from '@glyphui/ui'
import { AreaChart } from '@glyphui/ui/chart'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'

const tones: Tone[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info']

const traffic = [
  { week: 'W1', visits: 1200, signups: 320, trials: 140 },
  { week: 'W2', visits: 1380, signups: 410, trials: 160 },
  { week: 'W3', visits: 1510, signups: 380, trials: 210 },
  { week: 'W4', visits: 1720, signups: 470, trials: 190 },
  { week: 'W5', visits: 1890, signups: 520, trials: 260 },
  { week: 'W6', visits: 2110, signups: 590, trials: 280 },
]

const members = [
  { name: 'Ada Lovelace', role: 'Owner', status: 'Active' },
  { name: 'Grace Hopper', role: 'Admin', status: 'Active' },
  { name: 'Alan Turing', role: 'Member', status: 'Invited' },
]

/**
 * A realistic screen built from Glyph components, rendered with the theme being edited. It
 * covers every token the studio changes: surfaces, text, brand and status colors, charts,
 * radius, borders, shadows, density, type and motion.
 */
export function StudioBoard({ theme, mode }: { theme: Theme; mode: ColorMode }) {
  const [open, setOpen] = useState(false)
  return (
    <ThemeScope
      theme={theme}
      mode={mode}
      data-testid="studio-board"
      className="overflow-hidden rounded-xl border-(length:--glyph-border-width) border-border"
    >
      <Navbar
        sticky={false}
        blurOnScroll={false}
        containerSize="full"
        brand={<span className="font-display text-h4">Acme</span>}
        links={[
          { label: 'Overview', href: '#overview', active: true },
          { label: 'Projects', href: '#projects' },
          { label: 'Team', href: '#team' },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<Search />}>
              Search <Kbd className="ml-1">⌘K</Kbd>
            </Button>
            <Avatar name="Ada Lovelace" size="sm" />
          </>
        }
      />
      <div className="grid gap-5 bg-subtle p-5 sm:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="grid gap-1">
            <Text size="small" tone="muted" className="font-mono uppercase tracking-wider">
              Workspace
            </Text>
            <h2 className="font-display text-h2">Good morning, Ada</h2>
          </div>
          <Button leftIcon={<Plus />} onClick={() => setOpen(true)}>
            New project
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Active users" value="12,480" delta="8.2%" trend="up" />
          <StatCard label="Conversion" value="4.6%" delta="0.4%" trend="up" />
          <StatCard label="Churn" value="1.9%" delta="0.3%" trend="down" invertTrend />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Card>
            <Tabs defaultValue="traffic" className="grid gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Growth</CardTitle>
                <TabsList>
                  <TabsTrigger value="traffic">Traffic</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="traffic">
                <AreaChart
                  title="Weekly funnel"
                  data={traffic}
                  index="week"
                  height={220}
                  series={[
                    { key: 'visits', label: 'Visits' },
                    { key: 'signups', label: 'Sign-ups' },
                    { key: 'trials', label: 'Trials' },
                  ]}
                />
              </TabsContent>
              <TabsContent value="team">
                <Table aria-label="Team">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => (
                      <TableRow key={m.name}>
                        <TableCell>{m.name}</TableCell>
                        <TableCell className="text-muted-foreground">{m.role}</TableCell>
                        <TableCell>
                          <Badge tone={m.status === 'Active' ? 'success' : 'warning'} dot>
                            {m.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invite your team</CardTitle>
              <CardDescription>They get access to every project in Acme.</CardDescription>
            </CardHeader>
            <CardBody className="grid gap-4">
              <Field label="Email">
                <Input placeholder="grace@acme.dev" />
              </Field>
              <Field label="Role">
                <Select defaultValue="member">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </Select>
              </Field>
              <Field orientation="horizontal" label="Weekly digest">
                <Switch defaultChecked />
              </Field>
              <Field orientation="horizontal" label="Can create projects">
                <Checkbox defaultChecked />
              </Field>
            </CardBody>
            <CardFooter className="justify-end gap-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Send invite</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="gap-4">
            <Text size="small" weight="medium">
              Buttons
            </Text>
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Delete</Button>
              <Button variant="link">Link</Button>
            </div>
            <Text size="small" weight="medium">
              Badges
            </Text>
            <div className="flex flex-wrap gap-2">
              {tones.map((tone) => (
                <Badge key={tone} tone={tone} className="capitalize">
                  {tone}
                </Badge>
              ))}
            </div>
            <Progress value={64} aria-label="Storage used" />
          </Card>
          <div className="grid content-start gap-3">
            <Alert tone="info" title="Usage-based billing is live">
              Invoices now include metered usage from the last period.
            </Alert>
            <Alert tone="warning" title="Your trial ends in 3 days">
              Add a payment method to keep your projects.
            </Alert>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="New project"
        description="You can change these details later."
        // The modal renders outside the preview; this keeps it on the edited theme.
        data-glyph-theme={theme.name}
        data-mode={mode}
        className="font-sans text-foreground"
        footer={
          <>
            <ModalClose asChild>
              <Button variant="outline">Cancel</Button>
            </ModalClose>
            <ModalClose asChild>
              <Button>Create project</Button>
            </ModalClose>
          </>
        }
      >
        <Field label="Project name">
          <Input defaultValue="Website redesign" />
        </Field>
      </Modal>
    </ThemeScope>
  )
}
