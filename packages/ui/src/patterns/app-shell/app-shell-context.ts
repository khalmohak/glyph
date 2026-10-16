import { createContext, useContext } from 'react'

export interface AppShellContextValue {
  /** Desktop sidebar is collapsed to an icon rail. */
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  /** Mobile navigation drawer is open. */
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  /** True for the sidebar copy rendered inside the mobile drawer. */
  inDrawer: boolean
}

export const AppShellContext = createContext<AppShellContextValue | null>(null)

/** Sidebar state. Works outside an AppShell too (always expanded). */
export function useAppShell(): AppShellContextValue {
  return (
    useContext(AppShellContext) ?? {
      collapsed: false,
      setCollapsed: () => {},
      mobileOpen: false,
      setMobileOpen: () => {},
      inDrawer: false,
    }
  )
}
