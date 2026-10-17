import { LazyMotion, MotionConfig } from 'motion/react'
import { type ReactNode, useEffect } from 'react'
import { useMotionSettings } from './use-motion-settings'

const loadFeatures = () => import('./features').then((mod) => mod.default)
const instant = { duration: 0 } as const

/**
 * Connects the `motion` library to the theme: one lazily loaded feature bundle, the theme's
 * spring as the default transition, and instant transitions when motion is off.
 */
export function MotionScope({ children }: { children: ReactNode }) {
  const { animate, spring } = useMotionSettings()
  return (
    <LazyMotion features={loadFeatures}>
      <MotionConfig reducedMotion="user" transition={animate ? spring : instant}>
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}

/** Mirrors the effective motion level onto `<html data-motion>` so CSS animations follow it. */
export function MotionRootAttribute() {
  const { level } = useMotionSettings()
  useEffect(() => {
    const root = document.documentElement
    const previous = root.getAttribute('data-motion')
    root.setAttribute('data-motion', level)
    return () => {
      if (previous === null) root.removeAttribute('data-motion')
      else root.setAttribute('data-motion', previous)
    }
  }, [level])
  return null
}

/** Inside a `ThemeScope`: `motion` transitions use that theme's spring and level. */
export function ScopedMotionConfig({ children }: { children: ReactNode }) {
  const { animate, spring } = useMotionSettings()
  return (
    <MotionConfig reducedMotion="user" transition={animate ? spring : instant}>
      {children}
    </MotionConfig>
  )
}
