import { diffLines, diffWordsWithSpace } from 'diff'

/** A run of text in a changed line; `changed` marks the words that differ. */
export interface DiffSegment {
  text: string
  changed: boolean
}

export interface DiffLine {
  type: 'context' | 'added' | 'removed'
  /** Line number in the old text (context and removed lines). */
  oldNumber?: number
  /** Line number in the new text (context and added lines). */
  newNumber?: number
  text: string
  /** Word-level detail for a changed line that has a counterpart. */
  segments?: DiffSegment[]
}

/** Unchanged lines folded away, with the lines themselves so they can be expanded. */
export interface DiffGap {
  type: 'gap'
  id: string
  lines: DiffLine[]
}

export type DiffItem = DiffLine | DiffGap

export interface DiffResult {
  items: DiffItem[]
  additions: number
  deletions: number
}

/**
 * Windows (`\r\n`) and old Mac (`\r`) line endings become `\n`, and the text ends with
 * one newline, so a file saved on another OS or without a final newline doesn't show
 * every line as changed.
 */
function normalize(text: string): string {
  const unix = text.replace(/\r\n?/g, '\n')
  return unix === '' || unix.endsWith('\n') ? unix : `${unix}\n`
}

function splitLines(value: string): string[] {
  const lines = value.split('\n')
  if (lines.at(-1) === '') lines.pop()
  return lines
}

/** Pairs a removed block with the added block after it and diffs them word by word. */
function addWordDiffs(removed: DiffLine[], added: DiffLine[]): void {
  const pairs = Math.min(removed.length, added.length)
  for (let i = 0; i < pairs; i++) {
    const before = removed[i] as DiffLine
    const after = added[i] as DiffLine
    const parts = diffWordsWithSpace(before.text, after.text)
    // Mostly rewritten lines read better whole than as confetti.
    const kept = parts.filter((p) => !p.added && !p.removed).reduce((n, p) => n + p.value.length, 0)
    if (kept < Math.min(before.text.length, after.text.length) * 0.3) continue
    before.segments = parts
      .filter((p) => !p.added)
      .map((p) => ({ text: p.value, changed: Boolean(p.removed) }))
    after.segments = parts
      .filter((p) => !p.removed)
      .map((p) => ({ text: p.value, changed: Boolean(p.added) }))
  }
}

/**
 * Line diff of two texts with word-level detail on changed lines. Unchanged stretches
 * longer than `context * 2` lines are folded into gaps, keeping `context` lines around each
 * change. Pass `context: Infinity` to keep everything.
 */
export function computeDiff(oldText: string, newText: string, { context = 3 } = {}): DiffResult {
  const lines: DiffLine[] = []
  let oldNumber = 1
  let newNumber = 1
  let additions = 0
  let deletions = 0
  let removedBlock: DiffLine[] = []
  let addedBlock: DiffLine[] = []
  const flush = () => {
    addWordDiffs(removedBlock, addedBlock)
    removedBlock = []
    addedBlock = []
  }

  for (const part of diffLines(normalize(oldText), normalize(newText))) {
    for (const text of splitLines(part.value)) {
      if (part.added) {
        const line: DiffLine = { type: 'added', newNumber: newNumber++, text }
        addedBlock.push(line)
        lines.push(line)
        additions++
      } else if (part.removed) {
        if (addedBlock.length > 0) flush()
        const line: DiffLine = { type: 'removed', oldNumber: oldNumber++, text }
        removedBlock.push(line)
        lines.push(line)
        deletions++
      } else {
        flush()
        lines.push({ type: 'context', oldNumber: oldNumber++, newNumber: newNumber++, text })
      }
    }
  }
  flush()

  const items: DiffItem[] = []
  let run: DiffLine[] = []
  const closeRun = (atStart: boolean, atEnd: boolean) => {
    const keepBefore = atStart ? 0 : context
    const keepAfter = atEnd ? 0 : context
    if (run.length > keepBefore + keepAfter + 1) {
      items.push(...run.slice(0, keepBefore))
      const hidden = run.slice(keepBefore, run.length - keepAfter)
      items.push({ type: 'gap', id: `gap-${hidden[0]?.oldNumber ?? 0}`, lines: hidden })
      items.push(...run.slice(run.length - keepAfter))
    } else {
      items.push(...run)
    }
    run = []
  }
  for (const line of lines) {
    if (line.type === 'context') {
      run.push(line)
      continue
    }
    if (run.length > 0) closeRun(items.length === 0, false)
    items.push(line)
  }
  if (run.length > 0) closeRun(items.length === 0, true)
  // Nothing changed: show the text, unfolded.
  if (additions === 0 && deletions === 0) return { items: lines, additions, deletions }
  return { items, additions, deletions }
}

export interface SplitRow {
  left?: DiffLine
  right?: DiffLine
}

/** Lines arranged side by side: removed lines on the left facing their added counterparts. */
export function toSplitRows(lines: readonly DiffLine[]): SplitRow[] {
  const rows: SplitRow[] = []
  let removed: DiffLine[] = []
  let added: DiffLine[] = []
  const flush = () => {
    const n = Math.max(removed.length, added.length)
    for (let i = 0; i < n; i++) {
      const row: SplitRow = {}
      if (removed[i]) row.left = removed[i]
      if (added[i]) row.right = added[i]
      rows.push(row)
    }
    removed = []
    added = []
  }
  for (const line of lines) {
    if (line.type === 'removed') {
      if (added.length > 0) flush()
      removed.push(line)
    } else if (line.type === 'added') added.push(line)
    else {
      flush()
      rows.push({ left: line, right: line })
    }
  }
  flush()
  return rows
}
