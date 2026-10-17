export {
  type AuthClient,
  type AuthClientOptions,
  type AuthState,
  createAuthClient,
  type SignOutReason,
} from './core/client'
export { AuthError, type AuthErrorCode, isAuthError } from './core/errors'
export { can, hasRole } from './core/permissions'
export { NEXT_PARAM, safeRedirectPath, signInPathFor } from './core/redirect'
export type {
  AuthAdapter,
  AuthCapabilities,
  AuthSession,
  AuthStatus,
  AuthUser,
  DefaultUser,
  OAuthProvider,
  Organization,
  Register,
  SignInInput,
  SignInResult,
  SignUpInput,
} from './core/types'
export {
  AuthProvider,
  type AuthProviderProps,
  Can,
  type CanProps,
  type UseAuthResult,
  useAuth,
  useAuthClient,
  useCan,
  useHasRole,
  useSession,
  useUser,
} from './react/provider'
