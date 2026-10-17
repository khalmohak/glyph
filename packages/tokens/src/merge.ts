export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends string ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

/** Recursively merges plain objects. Values from `override` win; `undefined` is ignored. */
export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : override) as T
  }
  const out: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(override)) {
    // Overrides can be parsed JSON; never let them reach an object's prototype.
    if (value === undefined || UNSAFE_KEYS.has(key)) continue
    out[key] = deepMerge(out[key], value)
  }
  return out as T
}
