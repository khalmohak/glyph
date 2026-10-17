export type AuthErrorCode =
  | 'invalid-credentials'
  | 'email-taken'
  | 'weak-password'
  | 'invalid-code'
  | 'expired-token'
  | 'rate-limited'
  | 'not-supported'
  | 'session-expired'
  | 'network'
  | 'unknown'

/**
 * An error from an auth adapter. `fieldErrors` holds messages for individual form fields
 * (`email`, `password`, `code`, ...); the screens show them next to those fields.
 */
export class AuthError extends Error {
  readonly code: AuthErrorCode
  readonly fieldErrors: Readonly<Record<string, string>> | undefined
  readonly status: number | undefined
  /** For `rate-limited` errors: seconds until the server accepts another attempt, when it said. */
  readonly retryAfter: number | undefined

  constructor(
    message: string,
    options: {
      code?: AuthErrorCode
      fieldErrors?: Record<string, string> | undefined
      status?: number | undefined
      retryAfter?: number | undefined
      cause?: unknown
    } = {},
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause })
    this.name = 'AuthError'
    this.code = options.code ?? 'unknown'
    this.fieldErrors = options.fieldErrors
    this.status = options.status
    this.retryAfter = options.retryAfter
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}

export function notSupported(flow: string): AuthError {
  return new AuthError(`This sign-in method doesn't support ${flow}.`, { code: 'not-supported' })
}
