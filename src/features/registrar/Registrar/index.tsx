'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import {
  useMutation,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query'
import NextLink from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type { FieldErrors } from 'react-hook-form'

import { AppFrame, Link, Notice, RulePanel, TopBar } from '@design-system'

import { ActivityFields } from '@/components/ActivityFields'
import {
  activitiesQueries,
  createActivity,
  invalidateAfterActivityWrite,
  readProof,
} from '@/services/activities'
import { profileQueries } from '@/services/profile'
import { progressQueries } from '@/services/progress'
import { rulesQueries } from '@/services/rules'
import {
  ActivityFormSchema,
  buildPreview,
  EMPTY_FORM,
  parseBrDate,
  parseQuantity,
} from '@/utils/activity-form'
import type { ActivityFormInput, ActivityFormOutput } from '@/utils/activity-form'

import { ErrorSummary } from './_components/ErrorSummary'
import type { ErrorSummaryItem } from './_components/ErrorSummary'
import { ItemStep } from './_components/ItemStep'
import { ProofStep } from './_components/ProofStep'
import { Registered } from './_components/Registered'
import { SubmitBar } from './_components/SubmitBar'
import { Empty } from './Empty'
import { suggestionToForm } from './utils'
import * as S from './styles'

// Ordem dos campos na tela, que é a ordem do resumo de erros.
const FIELD_ORDER = ['name', 'quantity', 'startDate', 'endDate'] as const

function toSummary(errors: FieldErrors<ActivityFormInput>): ErrorSummaryItem[] {
  return FIELD_ORDER.flatMap((field) => {
    const message = errors[field]?.message

    return message ? [{ fieldId: field, message }] : []
  })
}

/**
 * Tela Registrar atividade: o aluno anexa o comprovante, confere o item que a leitura sugeriu, vê
 * quanto a atividade vai contar e registra.
 *
 * @remarks
 * A leitura (`readProof`) só sugere e preenche o formulário: nada é gravado antes de tocar em
 * Registrar. Leitura que falha não é erro, a tela abre a lista de itens para o aluno preencher à mão.
 * Trocar o arquivo apaga a leitura, o item e os campos. A prévia do `RulePanel` usa o cálculo único
 * sobre todas as atividades (RNF20) e não grava nada. O envio que falha mantém os campos e o
 * comprovante (RNF24); o que dá certo chama `invalidateAfterActivityWrite`. Sem itens no curso,
 * mostra o `Empty`. Não usa a barra inferior. A página envolve este componente em `Suspense`, com
 * `Loading` como fallback.
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
  const queryClient = useQueryClient()
  const summaryRef = useRef<HTMLDivElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [itemNumber, setItemNumber] = useState<number | null>(null)
  const [isChangingItem, setIsChangingItem] = useState(false)
  const [summaryFocusRequest, setSummaryFocusRequest] = useState(0)
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
  const registering = useMutation({
    mutationFn: createActivity,
    // Espera o total novo antes de mostrar o sucesso, para a tela não exibir o total velho. Se a
    // busca falhar, a atividade já está gravada: o sucesso aparece mesmo assim, nunca vira erro.
    onSuccess: () => {
      invalidateAfterActivityWrite(queryClient)
      return queryClient.fetchQuery(progressQueries.summary()).catch(() => undefined)
    },
  })
  const [{ data: profile }, { data: activities }, { data: progress }] = useSuspenseQueries({
    queries: [profileQueries.detail(), activitiesQueries.list(), progressQueries.summary()],
  })

  // O foco vai ao resumo depois que ele aparece na tela, não no mesmo instante do envio.
  useEffect(() => {
    if (summaryFocusRequest > 0) summaryRef.current?.focus()
  }, [summaryFocusRequest])

  // O SessionGate leva quem não tem curso para Seu curso, então aqui o curso sempre existe. Sem esta
  // checagem, `null` viraria uma busca com id vazio e uma lista de itens vazia, sem aviso.
  if (profile.courseId === null) throw new Error('Registrar abriu sem curso no perfil.')

  // Depende do perfil, então espera as buscas de cima, que saem juntas.
  const { data: ruleItems } = useSuspenseQuery(rulesQueries.items(profile.courseId))

  if (ruleItems.length === 0) return <Empty />

  function startOver(): void {
    setFile(null)
    setItemNumber(null)
    setIsChangingItem(false)
    reading.reset()
    registering.reset()
    form.reset(EMPTY_FORM)
  }

  function handleSelect(selected: File): void {
    setFile(selected)
    setItemNumber(null)
    setIsChangingItem(false)
    registering.reset()
    reading.mutate(selected)
  }

  function handleItemChange(next: number | null): void {
    setItemNumber(next)
    setIsChangingItem(false)
  }

  function handleValid(values: ActivityFormOutput): void {
    // O botão fica desabilitado sem comprovante ou item, então isto não acontece pela tela.
    if (file === null || itemNumber === null) return
    registering.mutate({ ...values, itemNumber, proof: file })
  }

  if (registering.isSuccess) {
    return (
      <Registered activity={registering.data} progress={progress} onRegisterAnother={startOver} />
    )
  }

  const hasReadFinished = file !== null && (reading.isSuccess || reading.isError)
  const preview =
    hasReadFinished && itemNumber !== null
      ? buildPreview({
          activities,
          ruleItems,
          startSemester: profile.startSemester,
          itemNumber,
          quantity: parseQuantity(quantityText),
          startDate: parseBrDate(startDateText),
        })
      : null
  const summary = form.formState.isSubmitted ? toSummary(form.formState.errors) : []

  return (
    <AppFrame
      topBar={
        <TopBar variant="inner" title="Registrar atividade" backHref="/inicio" linkAs={NextLink} />
      }
      // Sem comprovante e item, registrar é impossível: o rodapé só entra com a prévia, e até lá a
      // foto do comprovante é a única ação primária da tela.
      bottomNav={
        preview === null ? undefined : (
          <SubmitBar
            formId={formId}
            willCount={preview.willCount}
            isWarning={preview.hours?.status === 'nao_conta'}
            isBusy={registering.isPending}
          />
        )
      }
    >
      <FormProvider {...form}>
        <S.Page
          id={formId}
          noValidate
          onSubmit={form.handleSubmit(handleValid, () => setSummaryFocusRequest((n) => n + 1))}
        >
          {summary.length > 0 ? <ErrorSummary items={summary} ref={summaryRef} /> : null}

          {registering.isError ? (
            <Notice format="block" tone="danger" title="A atividade não foi registrada">
              O que você preencheu e o comprovante continuam aqui. Confira a internet e toque em
              Registrar de novo.
            </Notice>
          ) : null}

          <ProofStep
            file={file}
            isReading={reading.isPending}
            onSelect={handleSelect}
            onReplace={startOver}
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
