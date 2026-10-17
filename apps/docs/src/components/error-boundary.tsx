import { Component, type ErrorInfo, type ReactNode } from 'react'

/** Keeps one broken preview from taking down a page of them. */
export class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Preview failed to render', error, info.componentStack)
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
