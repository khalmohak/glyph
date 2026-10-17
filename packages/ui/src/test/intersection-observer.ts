/**
 * A controllable IntersectionObserver for jsdom, which has none. Install it in a test,
 * then call `intersect(element)` to simulate scrolling the element into view.
 */
type Callback = (entries: { isIntersecting: boolean; target: Element }[]) => void

const observers = new Set<{ callback: Callback; targets: Set<Element> }>()

export function installIntersectionObserver() {
  observers.clear()
  globalThis.IntersectionObserver = class {
    private record: { callback: Callback; targets: Set<Element> }
    constructor(callback: Callback) {
      this.record = { callback, targets: new Set() }
      observers.add(this.record)
    }
    observe(target: Element) {
      this.record.targets.add(target)
    }
    unobserve(target: Element) {
      this.record.targets.delete(target)
    }
    disconnect() {
      observers.delete(this.record)
    }
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
  return () => {
    observers.clear()
    // biome-ignore lint/suspicious/noExplicitAny: removing the stub restores jsdom's default
    delete (globalThis as any).IntersectionObserver
  }
}

/** Reports `element` as visible (or hidden) to every observer watching it. */
export function intersect(element: Element, isIntersecting = true) {
  for (const { callback, targets } of [...observers]) {
    if (targets.has(element)) callback([{ isIntersecting, target: element }])
  }
}
