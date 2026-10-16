export type Status = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done'
export type Priority = 'urgent' | 'high' | 'medium' | 'low'

export interface Issue {
  id: string
  title: string
  status: Status
  priority: Priority
  assignee: string | null
  /** Hours since last update. */
  updated: number
}

/** Example data for the showcase. */
export const issues: Issue[] = [
  {
    id: 'GLY-142',
    title: 'Collapse Sidebar to an icon rail',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Ada Lovelace',
    updated: 2,
  },
  {
    id: 'GLY-141',
    title: 'Fluid type scale for display and h1',
    status: 'in-review',
    priority: 'medium',
    assignee: 'Alan Kay',
    updated: 5,
  },
  {
    id: 'GLY-139',
    title: 'Dark-mode highlight on elevated cards',
    status: 'done',
    priority: 'low',
    assignee: 'Ada Lovelace',
    updated: 26,
  },
  {
    id: 'GLY-137',
    title: 'Combobox keyboard navigation',
    status: 'todo',
    priority: 'urgent',
    assignee: 'Radia Perlman',
    updated: 30,
  },
  {
    id: 'GLY-136',
    title: 'publint and attw in CI',
    status: 'backlog',
    priority: 'medium',
    assignee: null,
    updated: 96,
  },
  {
    id: 'GLY-134',
    title: 'Pricing block monthly / yearly toggle',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Grace Hopper',
    updated: 8,
  },
  {
    id: 'GLY-131',
    title: 'Server field errors in Form',
    status: 'done',
    priority: 'high',
    assignee: 'Grace Hopper',
    updated: 50,
  },
  {
    id: 'GLY-129',
    title: 'Glyph MCP server: list components tool',
    status: 'todo',
    priority: 'high',
    assignee: 'Alan Kay',
    updated: 12,
  },
  {
    id: 'GLY-127',
    title: 'npx glyph init for Next.js',
    status: 'backlog',
    priority: 'high',
    assignee: null,
    updated: 140,
  },
  {
    id: 'GLY-125',
    title: 'Editorial preset: Prose component',
    status: 'backlog',
    priority: 'low',
    assignee: 'Ken Thompson',
    updated: 160,
  },
  {
    id: 'GLY-122',
    title: 'DataTable server-side pagination',
    status: 'todo',
    priority: 'medium',
    assignee: 'Radia Perlman',
    updated: 70,
  },
  {
    id: 'GLY-118',
    title: 'Theme playground exports a theme file',
    status: 'in-review',
    priority: 'high',
    assignee: 'Ken Thompson',
    updated: 3,
  },
]

export function timeAgo(hours: number): string {
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}
