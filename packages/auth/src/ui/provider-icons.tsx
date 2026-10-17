import type { ReactNode } from 'react'
import type { OAuthProvider } from '../core/types'

const svg = (children: ReactNode, viewBox = '0 0 24 24') => (
  <svg viewBox={viewBox} aria-hidden="true" focusable="false">
    {children}
  </svg>
)

/** Brand marks, drawn per each provider's guidelines: Google and Microsoft keep their colors. */
export const providerIcons: Record<string, ReactNode> = {
  google: svg(
    <>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3.02c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.28V6.61H1.27a12 12 0 0 0 0 10.78l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.27 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </>,
  ),
  github: svg(
    <path
      fill="currentColor"
      d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57v-2.02c-3.34.72-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .3Z"
    />,
  ),
  apple: svg(
    <path
      fill="currentColor"
      d="M16.37 12.73c-.03-2.76 2.26-4.1 2.36-4.16a5.07 5.07 0 0 0-4-2.16c-1.7-.17-3.32 1-4.18 1-.87 0-2.2-.98-3.61-.95a5.37 5.37 0 0 0-4.54 2.75c-1.94 3.36-.5 8.33 1.39 11.06.92 1.33 2.03 2.83 3.47 2.78 1.39-.06 1.92-.9 3.6-.9 1.67 0 2.15.9 3.62.87 1.5-.03 2.44-1.36 3.36-2.7a12.2 12.2 0 0 0 1.52-3.13 4.85 4.85 0 0 1-2.99-4.46ZM13.6 4.6A4.86 4.86 0 0 0 14.74 1a4.95 4.95 0 0 0-3.2 1.65 4.62 4.62 0 0 0-1.17 3.5 4.1 4.1 0 0 0 3.23-1.55Z"
    />,
  ),
  microsoft: svg(
    <>
      <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
      <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
      <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
    </>,
  ),
}

const names: Record<string, string> = {
  google: 'Google',
  github: 'GitHub',
  apple: 'Apple',
  microsoft: 'Microsoft',
}

export function providerName(provider: OAuthProvider): string {
  return names[provider] ?? `${provider[0]?.toUpperCase() ?? ''}${provider.slice(1)}`
}
