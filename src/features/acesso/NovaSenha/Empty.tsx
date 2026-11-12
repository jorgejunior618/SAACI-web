import type { ReactNode } from 'react'

import { ExpiredLink } from '@/features/acesso/_components/ExpiredLink'

/** Nova senha sem link que valha: sem token, vencido, já usado ou desconhecido. */
export function Empty(): ReactNode {
  return <ExpiredLink />
}
