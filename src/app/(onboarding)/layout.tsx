import type { ReactNode } from 'react'

import { SessionBoundary } from '@/app/_prefetch/session-boundary'

type Props = {
  children: ReactNode
}

export default function Layout({ children }: Props): ReactNode {
  return <SessionBoundary mode="onboarding">{children}</SessionBoundary>
}
