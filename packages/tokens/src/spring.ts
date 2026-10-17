import type { SpringConfig } from './schema'

export interface SpringEasing {
  /** A CSS `linear()` easing that follows the spring from 0 to 1. */
  easing: string
  /** Milliseconds until the spring settles within the threshold. */
  duration: number
}

export interface SpringEasingOptions {
  /** Points sampled along the curve. More points follow oscillation more closely. */
  samples?: number
  /** The spring counts as settled once it stays this close to 1. */
  threshold?: number
  /** Upper bound for very soft springs, in milliseconds. */
  maxDuration?: number
}

/** The spring every theme falls back to: quick, with almost no overshoot. */
export const defaultSpring: SpringConfig = { stiffness: 420, damping: 34 }

/**
 * Position of a spring released from 0 toward 1 with no initial velocity, at `t` seconds.
 * Closed-form solutions of the damped harmonic oscillator.
 */
export function springPosition({ stiffness, damping, mass = 1 }: SpringConfig, t: number): number {
  const w0 = Math.sqrt(stiffness / mass)
  const zeta = damping / (2 * Math.sqrt(stiffness * mass))
  let offset: number
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta)
    offset = -Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t))
  } else if (zeta === 1) {
    offset = -(1 + w0 * t) * Math.exp(-w0 * t)
  } else {
    const root = Math.sqrt(zeta * zeta - 1)
    const r1 = -w0 * (zeta - root)
    const r2 = -w0 * (zeta + root)
    const a = r2 / (r1 - r2)
    offset = a * Math.exp(r1 * t) + (-1 - a) * Math.exp(r2 * t)
  }
  return 1 + offset
}

const round = (n: number) => Math.round(n * 10_000) / 10_000

const positive = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n > 0

function isValidSpring({ stiffness, damping, mass = 1 }: SpringConfig): boolean {
  return (
    positive(stiffness) &&
    positive(mass) &&
    typeof damping === 'number' &&
    Number.isFinite(damping) &&
    damping >= 0
  )
}

/**
 * Turns a physical spring into a CSS easing and duration, so CSS animations and transitions
 * can move with the same spring as JavaScript-driven ones.
 */
export function springEasing(
  input: SpringConfig,
  { samples = 48, threshold = 0.002, maxDuration = 1200 }: SpringEasingOptions = {},
): SpringEasing {
  // A spring needs positive stiffness and mass and non-negative damping; anything else
  // (e.g. a theme loaded from data) would produce NaN or a curve that never comes back.
  const spring = isValidSpring(input) ? input : defaultSpring
  // Find the last moment the spring is still outside the threshold, at 1 ms resolution.
  let settled = 0
  for (let ms = 0; ms <= maxDuration; ms++) {
    if (Math.abs(1 - springPosition(spring, ms / 1000)) >= threshold) settled = ms
  }
  const duration = Math.max(1, Math.min(maxDuration, settled + 1))
  const points: number[] = []
  for (let i = 0; i <= samples; i++) {
    points.push(round(springPosition(spring, ((i / samples) * duration) / 1000)))
  }
  points[0] = 0
  points[samples] = 1
  return { easing: `linear(${points.join(', ')})`, duration }
}
