'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import NextLink from 'next/link'
import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'

import { AppFrame, Link, RulePanel, TopBar } from '@design-system'

import { activitiesQueries, readProof } from '@/services/activities'
import { profileQueries } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'

import { ActivityFields } from './_components/ActivityFields'
import { ItemStep } from './_components/ItemStep'
import { ProofStep } from './_components/ProofStep'
import { SubmitBar } from './_components/SubmitBar'
import { Empty } from './Empty'
import { ActivityFormSchema } from './schema'
import type { ActivityFormInput, ActivityFormOutput } from './schema'
import { buildPreview, EMPTY_FORM, parseBrDate, parseQuantity, suggestionToForm } from './utils'
import * as S from './styles'

/**
 * Tela Registrar atividade: o aluno anexa o comprovante, confere o item que a leitura sugeriu, vê
 * quanto a atividade vai contar e registra.
 *
 * @remarks
 * A leitura (`readProof`) só sugere e preenche o formulário: nada é gravado antes de tocar em
 * Registrar. Leitura que falha não é erro, a tela abre a lista de itens para o aluno preencher à mão.
 * Trocar o arquivo apaga a leitura, o item e os campos. A prévia do `RulePanel` usa o cálculo único
 * sobre todas as atividades (RNF20) e não grava nada. Sem itens no curso, mostra o `Empty`. Não usa
 * a barra inferior. A página envolve este componente em `Suspense`, com `Loading` como fallback.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <Registrar />
 * </Suspense>
 * ```
 */
export function Registrar(): ReactNode {
  const formId = useId()
  const [file, setFile] = useState<File | null>(null)
  const [itemNumber, setItemNumber] = useState<number | null>(null)
  const [isChangingItem, setIsChangingItem] = useState(false)
  const form = useForm<ActivityFormInput, unknown, ActivityFormOutput>({
    resolver: valibotResolver(ActivityFormSchema),
    defaultValues: EMPTY_FORM,
    mode: 'onTouched',
  })
  const [quantityText, startDateText] = useWatch({
    control: form.control,
    name: ['quantity', 'startDate'],
  })
  const reading = useMutation({
    mutationFn: readProof,
    onSuccess: (suggestion) => form.reset(suggestionToForm(suggestion)),
    onError: () => form.reset(EMPTY_FORM),
  })
  const [{ data: profile }, { data: activities }, { data: progress }] = useSuspenseQueries({
    queries: [profileQueries.detail(), activitiesQueries.list(), progressQueries.summary()],
  })

  // O SessionGate leva quem não tem curso para Seu curso, então aqui o curso sempre existe. Sem esta
  // checagem, `null` viraria uma busca com id vazio e uma lista de itens vazia, sem aviso.
  if (profile.courseId === null) throw new Error('Registrar abriu sem curso no perfil.')

  // Depende do perfil, então espera as buscas de cima, que saem juntas.
  const { data: ruleItems } = useSuspenseQuery(rulesQueries.items(profile.courseId))

  if (ruleItems.length === 0) return <Empty />

  function handleSelect(selected: File): void {
    setFile(selected)
    setItemNumber(null)
    setIsChangingItem(false)
    reading.mutate(selected)
  }

  function handleReplace(): void {
    setFile(null)
    setItemNumber(null)
    setIsChangingItem(false)
    reading.reset()
    form.reset(EMPTY_FORM)
  }

  function handleItemChange(next: number | null): void {
    setItemNumber(next)
    setIsChangingItem(false)
  }

  const hasReadFinished = file !== null && (reading.isSuccess || reading.isError)
  const preview =
    hasReadFinished && itemNumber !== null
      ? buildPreview({
          activities,
          ruleItems,
          categories: progress.categories,
          startSemester: profile.startSemester,
          itemNumber,
          quantity: parseQuantity(quantityText),
          startDate: parseBrDate(startDateText),
        })
      : null

  return (
    <AppFrame
      topBar={
        <TopBar variant="inner" title="Registrar atividade" backHref="/inicio" linkAs={NextLink} />
      }
      bottomNav={
        <SubmitBar
          formId={formId}
          willCount={preview?.willCount ?? null}
          isWarning={preview?.hours?.status === 'nao_conta'}
          isDisabled={preview === null}
        />
      }
    >
      <FormProvider {...form}>
        {/* Por enquanto o envio só valida os campos; gravar entra com o createActivity. */}
        <S.Page id={formId} noValidate onSubmit={form.handleSubmit(() => undefined)}>
          <ProofStep
            file={file}
            isReading={reading.isPending}
            onSelect={handleSelect}
            onReplace={handleReplace}
          />

          {hasReadFinished && (preview === null || isChangingItem) ? (
            <ItemStep
              // Cada leitura nova começa sem "Escolher outro" e com a busca vazia.
              key={`${reading.submittedAt}-${isChangingItem}`}
              items={ruleItems}
              suggestedItemNumber={reading.data?.itemNumber ?? null}
              hasReadFailed={reading.isError}
              value={itemNumber}
              onChange={handleItemChange}
              startWithList={isChangingItem}
            />
          ) : null}

          {preview !== null && !isChangingItem ? (
            <S.RuleBlock>
              <RulePanel
                itemNumber={preview.rule.itemNumber}
                itemName={preview.rule.name}
                rule={preview.rule.rule}
                usedHours={preview.usedHours}
                maxHours={preview.rule.maxHours}
                calcRows={preview.calcRows}
                willCount={preview.willCount ?? 0}
                warning={preview.warning}
              />
              <Link as="button" type="button" isStandalone onClick={() => setIsChangingItem(true)}>
                Trocar item
              </Link>
            </S.RuleBlock>
          ) : null}

          {preview !== null ? (
            <ActivityFields unit={preview.rule.ratio.unit} suggestion={reading.data ?? null} />
          ) : null}
        </S.Page>
      </FormProvider>
    </AppFrame>
  )
}
