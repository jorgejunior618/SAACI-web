import type { ReactNode } from 'react'

import * as S from './styles'

type Summary = {
  label: string
  value: string
  // Âmbar quando só parte conta.
  tone?: 'neutral' | 'warning' | 'muted'
  // "(antes 10,0h)", na correção.
  before?: string
}

type Props = {
  summary?: Summary
  note?: string
  children: ReactNode
  isPlain?: boolean
}

export function ActionFooter({ summary, note, children, isPlain }: Props): ReactNode {
  return (
    <S.Footer isPlain={isPlain}>
      {summary && (
        <S.Sum aria-live="polite">
          <span>{summary.label}</span>
          <span>
            {summary.before && <S.Before>{summary.before}</S.Before>}
            <b className={S.value({ tone: summary.tone ?? 'neutral' })}>{summary.value}</b>
          </span>
        </S.Sum>
      )}
      {children}
      {note && <S.Note>{note}</S.Note>}
    </S.Footer>
  )
}
