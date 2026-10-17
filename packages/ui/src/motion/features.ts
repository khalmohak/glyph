import { domMax } from 'motion/react'

/**
 * Animation features, loaded on demand by `LazyMotion` so they stay out of the initial
 * bundle. `domMax` because shared `layoutId` indicators need layout animations.
 */
export default domMax
