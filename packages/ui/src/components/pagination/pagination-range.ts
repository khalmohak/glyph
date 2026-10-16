export type PaginationItem = number | 'ellipsis'

/**
 * The page numbers to show, with `'ellipsis'` for gaps. Always includes the first and
 * last page and `siblingCount` pages on each side of the current one, and keeps the
 * number of items constant so the control doesn't jump in width.
 *
 * `paginationRange(6, 20)` → `[1, 'ellipsis', 5, 6, 7, 'ellipsis', 20]`
 */
export function paginationRange(
  page: number,
  pageCount: number,
  siblingCount = 1,
): PaginationItem[] {
  const count = Math.max(0, Math.floor(pageCount))
  if (count === 0) return []
  const current = Math.min(Math.max(1, Math.floor(page)), count)
  // first + last + current + 2 ellipses + siblings on both sides
  const slots = siblingCount * 2 + 5
  if (count <= slots) return range(1, count)

  const left = Math.max(current - siblingCount, 1)
  const right = Math.min(current + siblingCount, count)
  const showLeftGap = left > 2
  const showRightGap = right < count - 1
  const edge = 3 + siblingCount * 2

  if (!showLeftGap && showRightGap) return [...range(1, edge), 'ellipsis', count]
  if (showLeftGap && !showRightGap) return [1, 'ellipsis', ...range(count - edge + 1, count)]
  return [1, 'ellipsis', ...range(left, right), 'ellipsis', count]
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i)
}
