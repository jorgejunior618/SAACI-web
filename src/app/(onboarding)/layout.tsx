import type { ReactNode } from 'react'

import { SessionGate } from '@/components/SessionGate'

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props): ReactNode {
  return <SessionGate mode="onboarding">{children}</SessionGate>
}
