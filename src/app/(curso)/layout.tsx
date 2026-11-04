import type { ReactNode } from 'react'

import { AppFrame } from '@design-system'

import { SessionGate } from '@/components/SessionGate'

export default function Layout({ children }: { children: ReactNode }): ReactNode {
  return (
    <AppFrame>
      <SessionGate mode="curso">{children}</SessionGate>
    </AppFrame>
  )
}
