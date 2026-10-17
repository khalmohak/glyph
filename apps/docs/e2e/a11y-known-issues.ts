/**
 * Accessibility debt, tracked explicitly so the suite stays green while it is paid down.
 * Each entry allows one axe rule on matching nodes (`target` is a substring of the axe node
 * selector) on the listed routes, or on every route with `'*'`. Delete an entry when its
 * fix lands: the a11y suite fails on any violation not covered here.
 */
export interface KnownIssue {
  rule: string
  routes: '*' | string[]
  /** Substring of the axe selector or element HTML. Omit to match every node. */
  target?: string
  /** Limit to one color mode. */
  mode?: 'light' | 'dark'
  reason: string
}

export const knownIssues: KnownIssue[] = []

/** True when a violation on `route` is known debt. `node` is the axe selector plus the element HTML. */
export function isKnown(
  route: string,
  mode: 'light' | 'dark',
  rule: string,
  node: string,
): boolean {
  return knownIssues.some(
    (issue) =>
      issue.rule === rule &&
      (!issue.mode || issue.mode === mode) &&
      (issue.routes === '*' || issue.routes.includes(route)) &&
      (!issue.target || node.includes(issue.target)),
  )
}
