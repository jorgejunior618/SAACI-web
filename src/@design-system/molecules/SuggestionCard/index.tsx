// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

import { useId } from 'react'
import type { ReactNode } from 'react'

import { Button } from '../../atoms/Button'
import { Card } from '../../atoms/Card'
import { Spinner } from '../../atoms/Spinner'
import * as S from './styles'

/** O item que a leitura do certificado sugeriu. */
export type SuggestionCardItem = {
  /** Número do item no formulário oficial (7). */
  number: number
  /** Nome do item ("Curso na área de engenharia de computação"). */
  name: string
  /** A regra em texto simples, já com o máximo ("1h para cada 4h de curso, até 60h"). */
  rule: string
}

type ReadingProps = {
  /** A leitura do certificado está em andamento. */
  status: 'reading'
  /** Frase de espera, com o tempo esperado. Padrão: "Lendo seu certificado, cerca de 20 segundos". */
  readingMessage?: string
  item?: never
  onConfirm?: never
  onChooseOther?: never
}

type SuggestedProps = {
  /** A leitura terminou e achou um item. */
  status: 'suggested'
  /** Item sugerido. */
  item: SuggestionCardItem
  /** O aluno confirmou que é esse. Só aqui o item vira o valor do campo. */
  onConfirm: () => void
  /** O aluno quer outro: a tela abre o `ItemPicker`. */
  onChooseOther: () => void
  readingMessage?: never
}

export type SuggestionCardProps = ReadingProps | SuggestedProps

/** Textos fixos do componente. */
const TEXT = {
  reading: 'Lendo seu certificado, cerca de 20 segundos',
  question: 'Parece ser este item. É esse mesmo?',
  confirm: 'É esse',
  chooseOther: 'Escolher outro',
} as const

/**
 * Mostra o item que a leitura do certificado sugeriu, separado do campo, e só vale quando o aluno
 * confirma.
 *
 * @remarks
 * Enquanto a leitura corre, é uma linha de status com o spinner e o tempo esperado, sem caixa. Com a
 * sugestão, é um cartão neutro: a pergunta em cinza, o item e duas ações lado a lado, "É esse"
 * (primária) e "Escolher outro" (secundária). Não tem cor própria: o que veio da leitura se
 * reconhece pela pergunta. O campo de item nunca começa marcado com a sugestão, confirmar é ação do
 * aluno. Sem sugestão, a tela pula o cartão e abre o `ItemPicker`; leitura que falha não é erro, e
 * a tela escreve uma linha de apoio dizendo que o aluno preenche. Esses dois casos não são deste
 * componente.
 *
 * @example
 * ```tsx
 * <SuggestionCard
 *   status="suggested"
 *   item={{ number: 7, name: 'Curso na área de engenharia de computação', rule: '1h para cada 4h de curso, até 60h' }}
 *   onConfirm={() => setItem(7)}
 *   onChooseOther={() => setPickerOpen(true)}
 * />
 * ```
 */
export function SuggestionCard(props: SuggestionCardProps): ReactNode {
  const questionId = useId()

  if (props.status === 'reading') {
    const message = props.readingMessage ?? TEXT.reading

    return (
      <S.Status>
        {/* O spinner anuncia a frase como status; o texto visível fica fora da leitura para não repetir. */}
        <Spinner size="sm" label={message} />
        <span aria-hidden="true">{message}</span>
      </S.Status>
    )
  }

  const { item, onConfirm, onChooseOther } = props

  return (
    <Card as="section" aria-labelledby={questionId}>
      <S.Question id={questionId}>{TEXT.question}</S.Question>
      <S.Item>
        <S.ItemNumber>Item {item.number}</S.ItemNumber>
        <S.ItemName>{item.name}</S.ItemName>
        <S.ItemRule>{item.rule}</S.ItemRule>
      </S.Item>
      <S.Actions>
        <Button variant="primary" onClick={onConfirm}>
          {TEXT.confirm}
        </Button>
        <Button variant="secondary" onClick={onChooseOther}>
          {TEXT.chooseOther}
        </Button>
      </S.Actions>
    </Card>
  )
}
