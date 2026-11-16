'use client'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import NextLink from 'next/link'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { AppFrame, TopBar } from '@design-system'

import { readProof } from '@/services/activities'
import { profileQueries } from '@/services/profile'
import { rulesQueries } from '@/services/rules'

import { ItemStep } from './_components/ItemStep'
import { ProofStep } from './_components/ProofStep'
import { Empty } from './Empty'
import * as S from './styles'

/**
 * Tela Registrar atividade: o aluno anexa o comprovante, confere o item que a leitura sugeriu e
 * registra.
 *
 * @remarks
 * A leitura (`readProof`) só sugere: nada é gravado antes de tocar em Registrar. Leitura que falha
 * não é erro, a tela abre a lista de itens para o aluno preencher à mão. Trocar o arquivo apaga a
 * leitura e o item escolhido. Sem itens no curso, mostra o `Empty`. Não usa a barra inferior. A
 * página envolve este componente em `Suspense`, com `Loading` como fallback.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <Registrar />
 * </Suspense>
 * ```
 */
export function Registrar(): ReactNode {
  const [file, setFile] = useState<File | null>(null)
  const [itemNumber, setItemNumber] = useState<number | null>(null)
  const reading = useMutation({ mutationFn: readProof })
  const { data: profile } = useSuspenseQuery(profileQueries.detail())

  // O SessionGate leva quem não tem curso para Seu curso, então aqui o curso sempre existe. Sem esta
  // checagem, `null` viraria uma busca com id vazio e uma lista de itens vazia, sem aviso.
  if (profile.courseId === null) throw new Error('Registrar abriu sem curso no perfil.')

  // Depende do perfil, então espera a busca de cima.
  const { data: ruleItems } = useSuspenseQuery(rulesQueries.items(profile.courseId))

  if (ruleItems.length === 0) return <Empty />

  function handleSelect(selected: File): void {
    setFile(selected)
    setItemNumber(null)
    reading.mutate(selected)
  }

  function handleReplace(): void {
    setFile(null)
    setItemNumber(null)
    reading.reset()
  }

  const hasReadFinished = file !== null && (reading.isSuccess || reading.isError)

  return (
    <AppFrame
      topBar={
        <TopBar variant="inner" title="Registrar atividade" backHref="/inicio" linkAs={NextLink} />
      }
    >
      <S.Page>
        <ProofStep
          file={file}
          isReading={reading.isPending}
          onSelect={handleSelect}
          onReplace={handleReplace}
        />

        {hasReadFinished ? (
          <ItemStep
            // Cada leitura nova começa sem "Escolher outro" e com a busca vazia.
            key={reading.submittedAt}
            items={ruleItems}
            suggestedItemNumber={reading.data?.itemNumber ?? null}
            hasReadFailed={reading.isError}
            value={itemNumber}
            onChange={setItemNumber}
          />
        ) : null}
      </S.Page>
    </AppFrame>
  )
}
