'use client'

import type { ReactNode } from 'react'

import { useSincronizarTemaDoSistema } from '../theme'

export function ThemeSync(): ReactNode {
  useSincronizarTemaDoSistema()
  return null
}
