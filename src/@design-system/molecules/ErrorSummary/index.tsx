import type { ReactNode } from 'react'

import { Notice } from '../Notice'
import * as S from './styles'

type Props = {
  errors: { fieldId: string; message: string }[]
}

const titulo = (total: number): string =>
  total === 1 ? 'Falta corrigir 1 coisa' : `Falta corrigir ${total} coisas`

// Resumo no topo, com link para cada campo.
export function ErrorSummary({ errors }: Props): ReactNode {
  if (errors.length === 0) return null

  return (
    <Notice title={titulo(errors.length)} tone="danger" role="alert">
      <ul className={S.list}>
        {errors.map(({ fieldId, message }) => (
          <li key={fieldId}>
            <a href={`#${fieldId}`} className={S.link}>
              {message}
            </a>
          </li>
        ))}
      </ul>
    </Notice>
  )
}
