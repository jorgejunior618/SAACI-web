import type { ReactNode } from 'react'

import { GroupedList } from '@design-system'

import type { Pedido } from '@/services/formulario'
import { formatHoras, formatHorasInteiras } from '@/utils/formatHoras'

import * as S from './styles'

// Item, atividade e CH solicitada, como no formulário da coordenação.
export function TabelaDoPedido({ pedido }: { pedido: Pedido }): ReactNode {
  const semHoras = pedido.linhas.length - pedido.linhasComHoras.length

  return (
    <GroupedList inset="number" role="table" aria-label="O que vai no formulário">
      <li role="row" className={S.row({ kind: 'head' })}>
        <span role="columnheader">Item</span>
        <span role="columnheader">Atividade</span>
        <span role="columnheader">CH Solicitada</span>
      </li>
      {pedido.linhasComHoras.map((linha) => (
        <li key={linha.numero} role="row" className={S.row({ kind: 'body' })}>
          <span role="cell">{linha.numero}</span>
          <span role="cell" title={linha.nome}>
            {linha.nome}
          </span>
          <span role="cell">{formatHoras(linha.horas ?? 0)}</span>
        </li>
      ))}
      {semHoras > 0 && (
        <li role="row" className={S.row({ kind: 'muted' })}>
          <span role="cell" />
          <span role="cell">
            {semHoras} {semHoras === 1 ? 'item sem horas fica' : 'itens sem horas ficam'} com traço
          </span>
          <span role="cell">–</span>
        </li>
      )}
      <li role="row" className={S.row({ kind: 'total' })}>
        <span role="cell" />
        <span role="cell">Total</span>
        <span role="cell">{formatHorasInteiras(pedido.total)}</span>
      </li>
    </GroupedList>
  )
}
