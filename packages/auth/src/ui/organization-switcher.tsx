import {
  Avatar,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@glyphui/ui'
import { useState } from 'react'
import type { Organization } from '../core/types'
import { useAuth } from '../react/provider'

export interface OrganizationSwitcherProps {
  /** Adds "Create organization" at the bottom. */
  onCreate?: () => void
  /** Called after switching, e.g. to reload data for the new organization. */
  onSwitch?: (organization: Organization) => void
  className?: string
}

function ChevronsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="ml-auto size-4 shrink-0 text-muted-foreground"
    >
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  )
}

/**
 * Switches the active organization (workspace, team). Renders nothing unless the adapter
 * supports organizations and the user belongs to at least one.
 */
export function OrganizationSwitcher({ onCreate, onSwitch, className }: OrganizationSwitcherProps) {
  const { session, capabilities, switchOrganization } = useAuth()
  const [switching, setSwitching] = useState(false)
  const organizations = session?.organizations ?? []
  if (!capabilities.organizations || organizations.length === 0) return null
  const active =
    organizations.find((o) => o.id === session?.activeOrganizationId) ?? organizations[0]
  if (!active) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="organization-switcher"
        aria-busy={switching || undefined}
        className={cn(
          'flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-md p-1.5 text-left text-small font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <Avatar name={active.name} src={active.image} size="sm" className="rounded-sm" />
        <span className="truncate">{active.name}</span>
        <ChevronsIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={active.id}
          onValueChange={async (id) => {
            const next = organizations.find((o) => o.id === id)
            if (!next || id === active.id) return
            setSwitching(true)
            try {
              await switchOrganization(id)
              onSwitch?.(next)
            } finally {
              setSwitching(false)
            }
          }}
        >
          {organizations.map((organization) => (
            <DropdownMenuRadioItem key={organization.id} value={organization.id}>
              <span className="truncate">{organization.name}</span>
              {organization.role && (
                <span className="ml-auto pl-3 text-caption text-muted-foreground capitalize">
                  {organization.role}
                </span>
              )}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {onCreate && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onCreate}>Create organization</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
