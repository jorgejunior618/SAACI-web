import { semanticColors } from './colors'
import { durations, easings, radii, semanticShadows, sizes, spacing } from './spacing'
import { fonts } from './typography'

export { keyframes } from './spacing'
export { textStyles } from './typography'

export const tokens = {
  fonts,
  spacing,
  radii,
  sizes,
  durations,
  easings,
}

export const semanticTokens = {
  colors: semanticColors,
  shadows: semanticShadows,
}
