import type { ReactNode } from 'react'

import { badge } from './styles'

type Status = 'conta' | 'parcial' | 'nao_conta'

const ROTULOS: Record<Status, string> = {
  conta: 'Conta',
  parcial: 'Conta em parte',
  nao_conta: 'Não conta',
}

// Estado é texto e cor, nunca só cor.
export function StatusBadge({ status }: { status: Status }): ReactNode {
  return <span className={badge({ status })}>{ROTULOS[status]}</span>
}
