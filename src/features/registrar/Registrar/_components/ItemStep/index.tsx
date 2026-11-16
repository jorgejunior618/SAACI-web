'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { ItemPicker, Link, SuggestionCard } from '@design-system'

import type { RuleItem } from '@/services/rules'

import * as S from './styles'

type ItemStepProps = {
  /** Itens do curso do aluno, na ordem do formulário, de `rulesQueries.items`. */
  items: RuleItem[]
  /** Item que a leitura sugeriu. `null` quando a leitura não sugeriu nenhum ou falhou. */
  suggestedItemNumber: number | null
  /** A leitura falhou. Mostra a frase que pede para preencher à mão. */
  hasReadFailed: boolean
  /** Item escolhido pelo aluno. `null` até ele confirmar a sugestão ou escolher na lista. */
  value: number | null
  /** Recebe o item escolhido, ou `null` quando o aluno volta para a sugestão. */
  onChange: (itemNumber: number | null) => void
}

/**
 * Mostra o bloco do item do registro: a sugestão da leitura ou a lista de itens do curso.
 *
 * @remarks
 * O item nunca começa marcado com a sugestão: só vale depois de "É esse". Sem sugestão, ou com a
 * leitura falha, a lista abre direto. Guarda se o aluno pediu "Escolher outro" e o texto da busca,
 * então a tela troca a `key` a cada leitura nova para começar do zero.
 */
export function ItemStep({
  items,
  suggestedItemNumber,
  hasReadFailed,
  value,
  onChange,
}: ItemStepProps): ReactNode {
  const [isChoosingOther, setIsChoosingOther] = useState(false)
  const [query, setQuery] = useState('')

  const suggested = items.find((item) => item.itemNumber === suggestedItemNumber)

  if (suggested && value === null && !isChoosingOther) {
    return (
      <SuggestionCard
        status="suggested"
        item={{ number: suggested.itemNumber, name: suggested.name, rule: suggested.rule }}
        onConfirm={() => onChange(suggested.itemNumber)}
        onChooseOther={() => setIsChoosingOther(true)}
      />
    )
  }

  return (
    <S.Root>
      {hasReadFailed ? (
        <S.Support>
          Não conseguimos ler o comprovante. Escolha o item e preencha os dados da atividade.
        </S.Support>
      ) : null}

      <ItemPicker
        label="Em qual item do formulário essa atividade entra?"
        items={items.map((item) => ({ number: item.itemNumber, name: item.name, rule: item.rule }))}
        value={value}
        onChange={onChange}
        query={query}
        onQueryChange={setQuery}
        suggestions={['curso', 'evento', 'palestra']}
      />

      {suggested && isChoosingOther ? (
        <S.Support>
          A sugestão era o item {suggested.itemNumber}.{' '}
          <Link
            as="button"
            type="button"
            onClick={() => {
              setIsChoosingOther(false)
              onChange(null)
            }}
          >
            Voltar para a sugestão
          </Link>
        </S.Support>
      ) : null}
    </S.Root>
  )
}
