import type { StandardSchemaV1 } from '@standard-schema/spec'

/** A validation rule: returns an error message, or nothing when the value is fine. */
export type Rule = (value: string, values: Record<string, string>) => string | undefined

/**
 * A tiny Standard Schema for the auth forms, so `@glyphui/auth` doesn't require zod.
 * Every field is a string; rules run in order and the first message wins.
 */
export function fields<const T extends Record<string, readonly Rule[]>>(
  rules: T,
): StandardSchemaV1<{ [K in keyof T]: string }> {
  type Values = { [K in keyof T]: string }
  return {
    '~standard': {
      version: 1,
      vendor: 'glyph-auth',
      validate(input) {
        const values = (input ?? {}) as Record<string, string>
        const issues: StandardSchemaV1.Issue[] = []
        for (const [key, keyRules] of Object.entries(rules)) {
          const value = typeof values[key] === 'string' ? values[key] : ''
          for (const rule of keyRules) {
            const message = rule(value, values)
            if (message) {
              issues.push({ message, path: [key] })
              break
            }
          }
        }
        return issues.length ? { issues } : { value: values as Values }
      },
    },
  }
}

export const required =
  (message: string): Rule =>
  (value) =>
    value.trim() ? undefined : message

export const email =
  (message = 'Enter a valid email address.'): Rule =>
  (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : message

export const minLength =
  (length: number, message = `Use at least ${length} characters.`): Rule =>
  (value) =>
    value.length >= length ? undefined : message

export const sameAs =
  (field: string, message: string): Rule =>
  (value, values) =>
    value === values[field] ? undefined : message

export const digits =
  (length: number, message = `Enter the ${length}-digit code.`): Rule =>
  (value) =>
    new RegExp(`^\\d{${length}}$`).test(value) ? undefined : message
