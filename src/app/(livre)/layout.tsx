import type { ReactNode } from 'react'

import { AppFrame } from '@design-system'

export default function Layout({ children }: { children: ReactNode }): ReactNode {
  return <AppFrame>{children}</AppFrame>
}
