import type { ReactNode } from 'react'

import * as S from './styles'

type Row = { label: string; value: string }

type Props = {
  caption: string
  rows: readonly Row[]
  total: Row
}

// Mostrar a conta: toda tela que calcula horas termina em "Vai contar" ou "Conta no seu total".
export function CalcTable({ caption, rows, total }: Props): ReactNode {
  return (
    <table className={S.table} aria-live="polite">
      <caption>{caption}</caption>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">{total.label}</th>
          <td>{total.value}</td>
        </tr>
      </tfoot>
    </table>
  )
}
