import {
  AppShell,
  Avatar,
  Badge,
  type BadgeProps,
  Button,
  Heading,
  IconButton,
  PageHeader,
  SegmentedControl,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  SidebarTrigger,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
  useAppShell,
} from '@glyphui/ui'
import { createColumnHelper, DataTable } from '@glyphui/ui/data-table'
import {
  ChevronsUpDown,
  CircleDot,
  Inbox,
  Layers,
  ListFilter,
  Plus,
  Settings2,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Siren,
  SquareKanban,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { type Issue, issues, type Priority, type Status, timeAgo } from '../../data/issues'

const statusBadge: Record<Status, { label: string; tone: BadgeProps['tone'] }> = {
  backlog: { label: 'Backlog', tone: 'neutral' },
  todo: { label: 'Todo', tone: 'neutral' },
  'in-progress': { label: 'In progress', tone: 'warning' },
  'in-review': { label: 'In review', tone: 'info' },
  done: { label: 'Done', tone: 'success' },
}

const priorityIcon: Record<Priority, { icon: React.ReactNode; label: string }> = {
  urgent: { icon: <Siren className="text-danger" />, label: 'Urgent' },
  high: { icon: <SignalHigh />, label: 'High' },
  medium: { icon: <SignalMedium />, label: 'Medium' },
  low: { icon: <SignalLow />, label: 'Low' },
}

const priorityRank: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }

const col = createColumnHelper<Issue>()
const columns = [
  col.accessor('id', {
    header: 'ID',
    cell: (info) => (
      <span className="font-mono text-caption text-muted-foreground">{info.getValue()}</span>
    ),
  }),
  col.accessor('title', {
    header: 'Title',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    meta: { className: 'min-w-56' },
  }),
  col.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const s = statusBadge[info.getValue()]
      return (
        <Badge tone={s.tone} dot>
          {s.label}
        </Badge>
      )
    },
  }),
  col.accessor('priority', {
    header: 'Priority',
    sortingFn: (a, b) => priorityRank[a.original.priority] - priorityRank[b.original.priority],
    cell: (info) => {
      const p = priorityIcon[info.getValue()]
      return (
        <span className="flex items-center gap-1.5 text-muted-foreground [&>svg]:size-4">
          {p.icon}
          {p.label}
        </span>
      )
    },
  }),
  col.accessor('assignee', {
    header: 'Assignee',
    cell: (info) => {
      const name = info.getValue()
      return name ? (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <Avatar name={name} size="xs" />
          {name}
        </span>
      ) : (
        <span className="text-faint-foreground">Unassigned</span>
      )
    },
  }),
  col.accessor('updated', {
    header: 'Updated',
    cell: (info) => (
      <span className="whitespace-nowrap text-muted-foreground">{timeAgo(info.getValue())}</span>
    ),
    meta: { align: 'right' },
  }),
]

type View = 'all' | 'active' | 'backlog'
type DemoState = 'ready' | 'loading' | 'empty' | 'error'

const activeStatuses = new Set<Status>(['todo', 'in-progress', 'in-review'])

export function AppDemo() {
  const [state, setState] = useState<DemoState>('ready')

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid max-w-xl gap-2">
          <Heading level={3}>App layout and data</Heading>
          <Text tone="muted">
            AppShell with a bordered sidebar that collapses to an icon rail (and becomes a drawer on
            mobile), PageHeader, and a DataTable. Switch the state to see the built-in loading,
            empty and error views.
          </Text>
        </div>
        <SegmentedControl<DemoState>
          aria-label="Table state"
          size="sm"
          value={state}
          onValueChange={setState}
          options={[
            { value: 'ready', label: 'Ready' },
            { value: 'loading', label: 'Loading' },
            { value: 'empty', label: 'Empty' },
            { value: 'error', label: 'Error' },
          ]}
        />
      </div>

      <div className="h-[40rem] overflow-hidden rounded-xl border-(length:--glyph-border-width) border-border shadow-lg">
        <AppShell layout="embedded" sidebar={<DemoSidebar />} mobileBrand={<WorkspaceName />}>
          <IssuesPage state={state} onRetry={() => setState('ready')} />
        </AppShell>
      </div>
    </div>
  )
}

function WorkspaceName() {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-primary font-display text-caption text-primary-foreground">
        A
      </span>
      <span className="truncate text-small font-semibold group-data-[collapsed=true]/sidebar:hidden">
        Acme Inc.
      </span>
    </span>
  )
}

function DemoSidebar() {
  const [active, setActive] = useState('issues')
  const { collapsed } = useAppShell()
  const item = (id: string) => ({ active: active === id, onClick: () => setActive(id) })

  return (
    <Sidebar>
      <SidebarHeader className={collapsed ? 'justify-center' : 'justify-between'}>
        {!collapsed && <WorkspaceName />}
        {!collapsed && (
          <ChevronsUpDown className="size-4 text-faint-foreground" aria-hidden="true" />
        )}
        {collapsed && <SidebarTrigger />}
      </SidebarHeader>
      <SidebarContent>
        <SidebarSection>
          <SidebarItem icon={<Inbox />} badge={3} {...item('inbox')}>
            Inbox
          </SidebarItem>
          <SidebarItem icon={<CircleDot />} badge={12} {...item('issues')}>
            Issues
          </SidebarItem>
          <SidebarItem icon={<SquareKanban />} {...item('projects')}>
            Projects
          </SidebarItem>
          <SidebarItem icon={<Layers />} {...item('views')}>
            Views
          </SidebarItem>
        </SidebarSection>
        <SidebarSection label="Teams">
          <SidebarItem icon={<Users />} {...item('design')}>
            Design
          </SidebarItem>
          <SidebarItem icon={<Users />} {...item('engineering')}>
            Engineering
          </SidebarItem>
          <SidebarItem icon={<Users />} {...item('growth')}>
            Growth
          </SidebarItem>
        </SidebarSection>
      </SidebarContent>
      <SidebarFooter>
        <Avatar name="Ada Lovelace" size="sm" />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-small font-medium">Ada Lovelace</span>
            <IconButton size="sm" icon={<Settings2 />} aria-label="Settings" />
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

function IssuesPage({ state, onRetry }: { state: DemoState; onRetry: () => void }) {
  const [view, setView] = useState<View>('all')
  const { collapsed } = useAppShell()

  const rows = useMemo(() => {
    if (state === 'empty') return []
    if (view === 'active') return issues.filter((i) => activeStatuses.has(i.status))
    if (view === 'backlog') return issues.filter((i) => i.status === 'backlog')
    return issues
  }, [view, state])

  return (
    <div className="grid content-start gap-5 p-4 sm:p-6">
      <div className="hidden items-center gap-2 md:flex">
        {!collapsed && <SidebarTrigger />}
        <Text size="small" tone="faint">
          Engineering <span aria-hidden="true">/</span>{' '}
          <span className="text-foreground">Issues</span>
        </Text>
      </div>
      <PageHeader
        title="Issues"
        description="Everything the Glyph team is working on this cycle."
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<ListFilter />}>
              Filter
            </Button>
            <Button size="sm" leftIcon={<Plus />}>
              New issue
            </Button>
          </>
        }
      />
      <Tabs value={view} onValueChange={(v) => setView(v as View)}>
        <TabsList>
          <TabsTrigger value="all">All issues</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
        </TabsList>
      </Tabs>
      <DataTable
        aria-label="Issues"
        data={state === 'loading' ? undefined : rows}
        columns={columns}
        loading={state === 'loading'}
        error={
          state === 'error'
            ? new Error('The issues service timed out after 10 seconds.')
            : undefined
        }
        onRetry={onRetry}
        getRowId={(issue) => issue.id}
        selectable
        search={{ placeholder: 'Search issues…' }}
        pageSize={6}
        initialSorting={[{ id: 'updated', desc: false }]}
        empty={
          <div className="grid justify-items-center gap-3 px-6 py-12 text-center">
            <p className="text-body font-medium">No issues in this view</p>
            <Text size="small" tone="muted">
              Create an issue to start tracking work.
            </Text>
            <Button size="sm" leftIcon={<Plus />}>
              New issue
            </Button>
          </div>
        }
      />
    </div>
  )
}
