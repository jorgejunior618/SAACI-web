import { useId } from 'react'
import type { ReactNode } from 'react'

import { formatHours } from '@/utils/format-hours'

import { Card } from '../../atoms/Card'
import { ProgressBar } from '../../atoms/ProgressBar'
import { Notice } from '../../molecules/Notice'
import * as S from './styles'

/** Uma linha da tabela do cálculo. */
export type RulePanelRow = {
  /** O que a linha explica ("3 palestras × 2h", "Cabem neste item"). */
  label: string
  /** Horas da linha, já calculadas. Todas as linhas usam a mesma unidade para alinhar. */
  value: number
}

export type RulePanelProps = {
  /** Número do item no formulário do curso (13). */
  itemNumber: number
  /** Nome do item ("Palestra como ouvinte"). */
  itemName: string
  /** A regra em frase completa ("Cada palestra conta 2h, não importa quantas horas ela durou."). */
  rule: string
  /** Horas que o aluno já tem neste item. */
  usedHours: number
  /** Máximo de horas do item. Com `usedHours` igual ou acima dele, "Ainda cabem" mostra 0,0h. */
  maxHours: number
  /** Linhas do cálculo na ordem em que aparecem, sem a linha final. */
  calcRows: RulePanelRow[]
  /** Horas que a atividade vai contar. É a linha final "Vai contar". */
  willCount: number
  /** Aviso do caso, numa frase com o que fazer a seguir. Um por vez; o mais grave primeiro. */
  warning?: string
}

/** Textos fixos do componente. Os que variam por item chegam por prop. */
const TEXT = {
  fitBefore: 'Ainda cabem ',
  fitAfter: ' neste item',
  caption: 'Quanto essa atividade vai contar',
  total: 'Vai contar',
  barLabel: 'Horas usadas neste item',
} as const

// "26h" quando é inteiro, "26,5h" quando não é: nunca esconde a parte decimal.
function formatUsed(value: number): string {
  return formatHours(value, { fractionDigits: Number.isInteger(value) ? 0 : 1 })
}

/**
 * Mostra a regra do item escolhido, quanto ainda cabe nele e quanto a atividade vai contar.
 *
 * @remarks
 * É o bloco que justifica o SAACI e fica visível enquanto o aluno preenche, nunca em tooltip. O
 * cartão é neutro, sem fundo verde: a ênfase está só no título. A tabela é uma região
 * `aria-live="polite"`, então o leitor de tela anuncia o novo resultado enquanto a pessoa digita. O
 * aviso não bloqueia o envio. O componente não calcula: recebe as linhas e o total prontos
 * (RNF20), e só formata com `formatHours`. O "Ainda cabem" é a diferença entre o máximo e o usado,
 * sem nunca ficar negativo.
 *
 * @example
 * ```tsx
 * <RulePanel
 *   itemNumber={13}
 *   itemName="Palestra como ouvinte"
 *   rule="Cada palestra conta 2h, não importa quantas horas ela durou."
 *   usedHours={26}
 *   maxHours={30}
 *   calcRows={[
 *     { label: '3 palestras × 2h', value: 6 },
 *     { label: 'Cabem neste item', value: 4 },
 *   ]}
 *   willCount={4}
 *   warning="Essa atividade vale 6,0h, mas só cabem mais 4,0h neste item."
 * />
 * ```
 */
export function RulePanel({
  itemNumber,
  itemName,
  rule,
  usedHours,
  maxHours,
  calcRows,
  willCount,
  warning,
}: RulePanelProps): ReactNode {
  const titleId = useId()
  const remaining = Math.max(maxHours - usedHours, 0)

  return (
    <Card as="section" aria-labelledby={titleId}>
      <S.Title id={titleId}>
        Item {itemNumber} · {itemName}
      </S.Title>
      <S.Rule>{rule}</S.Rule>

      <S.Fit>
        <span>
          {TEXT.fitBefore}
          <S.FitStrong>{formatHours(remaining)}</S.FitStrong>
          {TEXT.fitAfter}
        </span>
        <S.FitTotal>
          {formatUsed(usedHours)} de {formatUsed(maxHours)}
        </S.FitTotal>
      </S.Fit>
      <S.BarWrap>
        <ProgressBar value={usedHours} max={maxHours} label={TEXT.barLabel} />
      </S.BarWrap>

      <S.Table aria-live="polite">
        <S.Caption>{TEXT.caption}</S.Caption>
        <tbody>
          {calcRows.map((row) => (
            <tr key={row.label}>
              <S.Label scope="row">{row.label}</S.Label>
              <S.Value>{formatHours(row.value)}</S.Value>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <S.TotalLabel scope="row">{TEXT.total}</S.TotalLabel>
            <S.TotalValue>{formatHours(willCount)}</S.TotalValue>
          </tr>
        </tfoot>
      </S.Table>

      {warning ? (
        <S.WarningWrap>
          <Notice tone="warning">{warning}</Notice>
        </S.WarningWrap>
      ) : null}
    </Card>
  )
}
