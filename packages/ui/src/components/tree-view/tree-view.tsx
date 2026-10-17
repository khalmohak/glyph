import {
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useControllableState } from '../../hooks/use-controllable-state'
import { type TreeViewVariants, treeViewStyles } from './tree-view.styles'

export interface TreeNode {
  id: string
  label: ReactNode
  icon?: ReactNode
  children?: readonly TreeNode[]
  disabled?: boolean
  /** Text used for type-to-find when `label` is not a string. */
  textValue?: string
}

export interface TreeViewProps
  extends Omit<ComponentProps<'div'>, 'onSelect' | 'children' | 'defaultValue'>,
    TreeViewVariants {
  nodes: readonly TreeNode[]
  /** Ids of expanded nodes (controlled). */
  expanded?: readonly string[]
  defaultExpanded?: readonly string[]
  onExpandedChange?: (expanded: string[]) => void
  /** Id of the selected node (controlled). `null` for none. */
  selected?: string | null
  defaultSelected?: string | null
  onSelect?: (id: string, node: TreeNode) => void
  /** Required: describes the tree, e.g. "Project files". */
  'aria-label': string
}

interface VisibleNode {
  node: TreeNode
  level: number
  parentId: string | null
}

function flattenVisible(nodes: readonly TreeNode[], expanded: ReadonlySet<string>): VisibleNode[] {
  const out: VisibleNode[] = []
  const walk = (list: readonly TreeNode[], level: number, parentId: string | null) => {
    for (const node of list) {
      out.push({ node, level, parentId })
      if (node.children?.length && expanded.has(node.id)) walk(node.children, level + 1, node.id)
    }
  }
  walk(nodes, 1, null)
  return out
}

function textOf(node: TreeNode): string {
  return (node.textValue ?? (typeof node.label === 'string' ? node.label : '')).toLowerCase()
}

const NO_IDS: readonly string[] = []

/**
 * An accessible tree for file browsers and nested navigation. Arrow keys move and
 * expand/collapse, Home/End jump, typing a letter finds the next match, Enter or Space selects.
 */
export function TreeView(inProps: TreeViewProps) {
  const [props, slots] = useComponentConfig('TreeView', inProps)
  const {
    nodes,
    expanded: expandedProp,
    defaultExpanded = NO_IDS,
    onExpandedChange,
    selected: selectedProp,
    defaultSelected = null,
    onSelect,
    size,
    className,
    onKeyDown: userKeyDown,
    ...rest
  } = props

  const [expandedList, setExpandedList] = useControllableState<readonly string[]>({
    value: expandedProp,
    defaultValue: defaultExpanded,
    onChange: onExpandedChange as ((value: readonly string[]) => void) | undefined,
  })
  const [selected, setSelected] = useControllableState<string | null>({
    value: selectedProp,
    defaultValue: defaultSelected,
  })
  const expanded = useMemo(() => new Set(expandedList), [expandedList])
  const visible = useMemo(() => flattenVisible(nodes, expanded), [nodes, expanded])
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const refs = useRef(new Map<string, HTMLDivElement>())
  const baseId = useId()

  // The single tabbable item: the focused one, else the selected one if visible, else the first.
  const tabbableId =
    (focusedId && visible.some((v) => v.node.id === focusedId) && focusedId) ||
    (selected && visible.some((v) => v.node.id === selected) && selected) ||
    visible[0]?.node.id

  const focus = useCallback((id: string | undefined) => {
    if (!id) return
    setFocusedId(id)
    refs.current.get(id)?.focus()
  }, [])

  const toggle = useCallback(
    (id: string, open?: boolean) => {
      const isOpen = expanded.has(id)
      const next = open ?? !isOpen
      if (next === isOpen) return
      setExpandedList(next ? [...expandedList, id] : expandedList.filter((x) => x !== id))
    },
    [expanded, expandedList, setExpandedList],
  )

  const select = useCallback(
    (node: TreeNode) => {
      if (node.disabled) return
      setSelected(node.id)
      onSelect?.(node.id, node)
    },
    [onSelect, setSelected],
  )

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    userKeyDown?.(event)
    if (event.defaultPrevented) return
    const index = visible.findIndex((v) => v.node.id === tabbableId)
    const current = visible[index]
    if (!current) return
    const { node } = current
    const hasChildren = Boolean(node.children?.length)
    const isOpen = expanded.has(node.id)
    let handled = true

    switch (event.key) {
      case 'ArrowDown':
        focus(visible[index + 1]?.node.id)
        break
      case 'ArrowUp':
        focus(visible[index - 1]?.node.id)
        break
      case 'ArrowRight':
        if (hasChildren && !isOpen) toggle(node.id, true)
        else if (hasChildren) focus(node.children?.[0]?.id)
        break
      case 'ArrowLeft':
        if (hasChildren && isOpen) toggle(node.id, false)
        else if (current.parentId) focus(current.parentId)
        break
      case 'Home':
        focus(visible[0]?.node.id)
        break
      case 'End':
        focus(visible.at(-1)?.node.id)
        break
      case 'Enter':
      case ' ':
        select(node)
        break
      default:
        handled = false
        if (event.key.length === 1 && /\S/.test(event.key) && !event.metaKey && !event.ctrlKey) {
          const char = event.key.toLowerCase()
          const ordered = [...visible.slice(index + 1), ...visible.slice(0, index + 1)]
          const match = ordered.find((v) => textOf(v.node).startsWith(char))
          if (match) {
            focus(match.node.id)
            handled = true
          }
        }
    }
    if (handled) event.preventDefault()
  }

  const s = treeViewStyles({ size })

  /** Clicks bubble from nested items; only handle the item whose own row was clicked. */
  const onItemClick = (event: MouseEvent<HTMLDivElement>, node: TreeNode, hasChildren: boolean) => {
    const row = (event.target as HTMLElement).closest('[data-slot=tree-row]')
    if (row?.parentElement !== event.currentTarget) return
    focus(node.id)
    if (hasChildren) toggle(node.id)
    select(node)
  }

  const renderNodes = (list: readonly TreeNode[], level: number): ReactNode =>
    list.map((node, i) => {
      const hasChildren = Boolean(node.children?.length)
      const isOpen = hasChildren && expanded.has(node.id)
      return (
        // Keyboard interaction is handled once on the tree (roving focus), not per item.
        // biome-ignore lint/a11y/useKeyWithClickEvents: see above
        <div
          key={node.id}
          ref={(el) => {
            if (el) refs.current.set(node.id, el)
            else refs.current.delete(node.id)
          }}
          role="treeitem"
          data-slot="tree-item"
          // Name the item by its label only, not by the nested items it contains.
          aria-labelledby={`${baseId}-${node.id}`}
          aria-level={level}
          aria-setsize={list.length}
          aria-posinset={i + 1}
          aria-expanded={hasChildren ? isOpen : undefined}
          aria-selected={selected === node.id}
          aria-disabled={node.disabled || undefined}
          tabIndex={node.id === tabbableId ? 0 : -1}
          onFocus={(event) => {
            if (event.target === event.currentTarget) setFocusedId(node.id)
          }}
          onClick={(event) => onItemClick(event, node, hasChildren)}
          className={s.item({ class: slots.item })}
        >
          <div
            data-slot="tree-row"
            data-state={isOpen ? 'open' : 'closed'}
            className={s.row({ class: slots.row })}
            style={{ paddingInlineStart: `calc(${level - 1} * 1rem + 0.25rem)` }}
          >
            {hasChildren ? (
              <svg
                data-slot="tree-chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={s.chevron({ class: slots.chevron })}
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            ) : (
              <span className={s.spacer({ class: slots.spacer })} />
            )}
            {node.icon && (
              <span className={s.icon({ class: slots.icon })} aria-hidden="true">
                {node.icon}
              </span>
            )}
            <span id={`${baseId}-${node.id}`} className={s.label({ class: slots.label })}>
              {node.label}
            </span>
          </div>
          {isOpen && (
            // biome-ignore lint/a11y/useSemanticElements: role="group" is the WAI-ARIA tree pattern for child items
            <div role="group" className={s.group({ class: slots.group })}>
              {renderNodes(node.children ?? [], level + 1)}
            </div>
          )}
        </div>
      )
    })

  return (
    <div
      role="tree"
      data-slot="tree-view"
      onKeyDown={onKeyDown}
      className={s.root({ class: [slots.root, className] })}
      {...rest}
    >
      {renderNodes(nodes, 1)}
    </div>
  )
}
