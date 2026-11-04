import type { ReactNode } from 'react'

import { Card } from '../../atoms/Card'
import { InlineMessage } from '../../atoms/InlineMessage'
import { ProgressBar } from '../../atoms/ProgressBar'
import { CalcTable } from '../../molecules/CalcTable'
import * as S from './styles'

type Props = {
  head: string
  // Link "Trocar item".
  headAction?: ReactNode
  ruleText: string
  // "Ainda cabem 42,0h neste item".
  fit: ReactNode
  // "18h de 60h".
  used: string
  usedValue: number
  limit: number
  calc: {
    caption: string
    rows: { label: string; value: string }[]
    total: { label: string; value: string }
  }
  warning?: string
}

// Aparece assim que o item é escolhido: a regra, quanto cabe e a conta, antes do envio.
export function RulePanel({
  head,
  headAction,
  ruleText,
  fit,
  used,
  usedValue,
  limit,
  calc,
  warning,
}: Props): ReactNode {
  return (
    <Card aria-label="Regra do item">
      <S.Head>
        <S.HeadText>{head}</S.HeadText>
        {headAction}
      </S.Head>
      <S.Text>{ruleText}</S.Text>
      <S.Fit>
        <span>{fit}</span>
        <S.Muted>{used}</S.Muted>
      </S.Fit>
      <S.Bar>
        <ProgressBar value={usedValue} max={limit} />
      </S.Bar>
      <S.Calc>
        <CalcTable caption={calc.caption} rows={calc.rows} total={calc.total} />
      </S.Calc>
      {warning && (
        <S.Warning>
          <InlineMessage tone="warning">{warning}</InlineMessage>
        </S.Warning>
      )}
    </Card>
  )
}
