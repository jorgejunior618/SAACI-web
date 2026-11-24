// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

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
