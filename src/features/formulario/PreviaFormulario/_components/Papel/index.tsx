import type { ReactNode } from 'react'

import type { Pedido } from '@/services/formulario'
import { formatNumero } from '@/utils/numeros'

import * as S from './styles'

type Props = {
  cabecalho: string
  nome: string | null
  matricula: string | null
  pedido: Pedido
  geradoEm: string
}

const formatCh = (horas: number | null): string =>
  horas === null ? '–' : horas.toLocaleString('pt-BR', { minimumFractionDigits: 1 })

// Prévia fiel ao PDF: os 24 itens, com traço onde não há horas.
export function Papel({ cabecalho, nome, matricula, pedido, geradoEm }: Props): ReactNode {
  return (
    <S.Paper aria-label="Prévia do formulário">
      <S.Caption>{cabecalho}</S.Caption>
      <S.Title>Formulário para Solicitação de Atividades Complementares</S.Title>
      <S.Field>
        <span>Aluno</span>
        <span>{nome ?? ' '}</span>
      </S.Field>
      <S.Field>
        <span>Matrícula</span>
        <span>{matricula ?? ' '}</span>
      </S.Field>
      <S.Table>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Atividade</th>
            <th scope="col">CH Solicitada</th>
          </tr>
        </thead>
        <tbody>
          {pedido.linhas.map((linha) => (
            <tr key={linha.numero}>
              <td>{linha.numero}</td>
              <td title={linha.nome}>{linha.nome}</td>
              <td>{formatCh(linha.horas)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td />
            <td>Total</td>
            <td>{formatNumero(pedido.total)}</td>
          </tr>
        </tfoot>
      </S.Table>
      <S.Generated>Gerado pelo SAACI em {geradoEm}</S.Generated>
    </S.Paper>
  )
}
