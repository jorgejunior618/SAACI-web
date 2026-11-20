'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import NextLink from 'next/link'
import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'

import { AppFrame, ItemPicker, Link, Notice, RulePanel, SubmitBar, TopBar } from '@design-system'

import { ActivityFields } from '@/components/ActivityFields'
import {
  activitiesKeys,
  ActivityNotFoundError,
  InvalidActivityDatesError,
  InvalidActivityItemError,
  invalidateAfterActivityWrite,
  StaleActivityError,
  updateActivity,
} from '@/services/activities'
import type { Activity, ActivityCorrection } from '@/services/activities'
import type { RuleItem } from '@/services/rules'
import { ActivityFormSchema, buildPreview, parseQuantity } from '@/utils/activity-form'
import type { ActivityFormInput, ActivityFormOutput } from '@/utils/activity-form'
import { parseBrDate } from '@/utils/br-date'
import { formatHours } from '@/utils/format-hours'

import { activityToForm, getCorrection, getPreviousHints } from '../../utils'
import * as S from './styles'

type CorrectionFormProps = {
  /** A atividade como a tela leu. O `updatedAt` dela vai junto na gravação. */
  activity: Activity
  /** Todas as atividades do aluno, para a prévia com o cálculo único. */
  activities: Activity[]
  ruleItems: RuleItem[]
  /** Semestre de ingresso do perfil. */
  startSemester: string | null
  /** Volta ao detalhe sem gravar. */
  onCancel: () => void
  /** A correção foi gravada (ou não havia o que mudar). */
  onSaved: () => void
}

type Variables = { updatedAt: string; changes: ActivityCorrection }

/**
 * Formulário Corrigir dados: nome, item, quantidade e datas, com a prévia de quanto a atividade
 * passa a contar. O comprovante não se troca (ADR 0001).
 *
 * @remarks
 * A prévia usa o `buildPreview` em modo correção, que tira a própria atividade da conta (RNF20).
 * Grava só os campos alterados, com o `updatedAt` lido. Se outra tela mudou a atividade antes
 * (`StaleActivityError`), pede para abrir de novo: busca a atividade outra vez sem limpar o que foi
 * digitado, e o próximo envio usa o `updatedAt` novo. Se a atividade não chega (falha ou sem
 * internet), o aviso fica e diz para tentar de novo. Datas e item recusados viram erro no campo;
 * falha de rede mantém tudo e pede para tentar de novo. Sucesso chama `invalidateAfterActivityWrite`.
 */
export function CorrectionForm({
  activity,
  activities,
  ruleItems,
  startSemester,
  onCancel,
  onSaved,
}: CorrectionFormProps): ReactNode {
  const formId = useId()
  const queryClient = useQueryClient()
  const [before] = useState(() => activityToForm(activity))
  const [itemNumber, setItemNumber] = useState(activity.itemNumber)
  const [isChangingItem, setIsChangingItem] = useState(false)
  const [query, setQuery] = useState('')
  const [isReloading, setIsReloading] = useState(false)
  const [reloadFailed, setReloadFailed] = useState(false)
  const form = useForm<ActivityFormInput, unknown, ActivityFormOutput>({
    resolver: valibotResolver(ActivityFormSchema),
    defaultValues: before,
    mode: 'onTouched',
  })
  const current = useWatch({ control: form.control }) as ActivityFormInput
  const saving = useMutation({
    mutationFn: ({ updatedAt, changes }: Variables) =>
      updateActivity(activity.id, updatedAt, changes),
    onSuccess: (saved) => {
      // O detalhe já mostra o que foi gravado; a invalidação confere com o banco em seguida.
      queryClient.setQueryData(activitiesKeys.detail(saved.id), saved)
      invalidateAfterActivityWrite(queryClient)
      onSaved()
    },
    onError: (error) => {
      if (error instanceof InvalidActivityDatesError) {
        form.setError('endDate', { message: error.message }, { shouldFocus: true })
      }
    },
  })

  const rule = ruleItems.find((item) => item.itemNumber === itemNumber)

  if (!rule) throw new Error(`O item ${itemNumber} não está nas regras do curso.`)

  const preview = buildPreview({
    activities,
    ruleItems,
    startSemester,
    itemNumber,
    quantity: parseQuantity(current.quantity ?? ''),
    startDate: parseBrDate(current.startDate ?? ''),
    replacing: activity,
  })
  const hints = getPreviousHints(before, current)

  // Busca a atividade de novo. O formulário não muda: o que foi digitado continua nos campos. O aviso
  // só sai quando o detalhe chegou de fato: o `refetchQueries` não rejeita na falha nem na pausa sem
  // internet, então o desfecho vem do estado da query. A lista não decide: a gravação só precisa do
  // `updatedAt` do detalhe.
  async function reload(): Promise<void> {
    const startedAt = Date.now()
    const detailKey = activitiesKeys.detail(activity.id)

    setIsReloading(true)
    setReloadFailed(false)
    await Promise.all([
      queryClient.refetchQueries({ queryKey: detailKey }),
      queryClient.refetchQueries({ queryKey: activitiesKeys.lists() }),
    ])

    const state = queryClient.getQueryState(detailKey)
    const isFresh =
      state?.status === 'success' &&
      state.fetchStatus === 'idle' &&
      state.dataUpdatedAt >= startedAt

    setIsReloading(false)
    if (isFresh) saving.reset()
    else setReloadFailed(true)
  }

  function handleValid(values: ActivityFormOutput): void {
    const changes = getCorrection(activity, values, itemNumber)

    if (Object.keys(changes).length === 0) {
      onSaved()
      return
    }
    setReloadFailed(false)
    saving.mutate({ updatedAt: activity.updatedAt, changes })
  }

  function handleItemChange(next: number): void {
    setItemNumber(next)
    setIsChangingItem(false)
  }

  return (
    <AppFrame
      topBar={<TopBar variant="inner" title="Corrigir atividade" onBack={onCancel} />}
      bottomNav={
        <SubmitBar
          formId={formId}
          summaryLabel={`Vai contar (antes ${formatHours(activity.countedHours)})`}
          willCount={preview.willCount}
          isWarning={preview.hours !== null && preview.hours.status !== 'conta'}
          busy={saving.isPending}
          busyLabel="Salvando"
        >
          Salvar correção
        </SubmitBar>
      }
    >
      <FormProvider {...form}>
        <S.Page id={formId} noValidate onSubmit={form.handleSubmit(handleValid)}>
          <SaveError
            error={saving.error}
            isReloading={isReloading}
            reloadFailed={reloadFailed}
            onReload={() => void reload()}
          />

          {isChangingItem ? (
            <S.ItemBlock>
              <ItemPicker
                label="Em qual item do formulário essa atividade entra?"
                items={ruleItems.map((item) => ({
                  number: item.itemNumber,
                  name: item.name,
                  rule: item.rule,
                }))}
                value={itemNumber}
                onChange={handleItemChange}
                query={query}
                onQueryChange={setQuery}
                suggestions={['curso', 'evento', 'palestra']}
              />
              <Link as="button" type="button" isStandalone onClick={() => setIsChangingItem(false)}>
                Manter o item {itemNumber}
              </Link>
            </S.ItemBlock>
          ) : (
            <S.RuleBlock>
              <RulePanel
                itemNumber={rule.itemNumber}
                itemName={rule.name}
                rule={rule.rule}
                usedHours={preview.usedHours}
                maxHours={rule.maxHours}
                calcRows={preview.calcRows}
                willCount={preview.willCount ?? 0}
                warning={preview.warning}
              />
              <Link as="button" type="button" isStandalone onClick={() => setIsChangingItem(true)}>
                Trocar item
              </Link>
            </S.RuleBlock>
          )}

          <ActivityFields unit={rule.ratio.unit} suggestion={null} hints={hints} />

          <Notice tone="neutral">
            O comprovante não muda na correção. Para usar outro arquivo, remova a atividade e
            registre de novo.
          </Notice>
        </S.Page>
      </FormProvider>
    </AppFrame>
  )
}

type SaveErrorProps = {
  error: Error | null
  isReloading: boolean
  /** "Abrir de novo" não trouxe a atividade (falha ou sem internet). */
  reloadFailed: boolean
  onReload: () => void
}

// O aviso de quando a gravação falha. Cada caso diz o que aconteceu e o que fazer.
function SaveError({ error, isReloading, reloadFailed, onReload }: SaveErrorProps): ReactNode {
  if (error === null || error instanceof InvalidActivityDatesError) return null

  if (error instanceof StaleActivityError) {
    return (
      <Notice
        format="block"
        tone="warning"
        title="Esta atividade mudou desde que você a abriu"
        role="alert"
        actions={
          <Link as="button" type="button" isStandalone aria-busy={isReloading} onClick={onReload}>
            {isReloading ? 'Abrindo' : 'Abrir de novo'}
          </Link>
        }
      >
        {reloadFailed
          ? 'Não deu para abrir a atividade de novo. Confira a internet e toque em Abrir de novo.'
          : 'O que você digitou continua aqui. Abra a atividade de novo para ver como ela está e toque em Salvar correção.'}
      </Notice>
    )
  }
  if (error instanceof InvalidActivityItemError) {
    return (
      <Notice
        format="block"
        tone="danger"
        title="Este item não está nas regras do seu curso"
        role="alert"
      >
        Toque em Trocar item e escolha um item da lista.
      </Notice>
    )
  }
  if (error instanceof ActivityNotFoundError) {
    return (
      <Notice
        format="block"
        tone="danger"
        title="Esta atividade foi removida"
        role="alert"
        actions={
          <Link as={NextLink} href="/atividades" isStandalone>
            Voltar para Atividades
          </Link>
        }
      >
        Não há mais o que corrigir. Se precisar dela, registre de novo.
      </Notice>
    )
  }
  return (
    <Notice format="block" tone="danger" title="A correção não foi salva" role="alert">
      O que você digitou continua aqui. Confira a internet e toque em Salvar correção de novo.
    </Notice>
  )
}
