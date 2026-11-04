import type { ReactNode } from 'react'

import { AppFrame } from '@design-system'

import { BottomNav } from '@/components/BottomNav'
import { SessionGate } from '@/components/SessionGate'

export default function Layout({ children }: { children: ReactNode }): ReactNode {
  return (
    <AppFrame hasNav>
      <SessionGate mode="aluno">{children}</SessionGate>
      <BottomNav />
    </AppFrame>
  )
}
