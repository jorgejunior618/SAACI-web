'use client'

import type { ChangeEvent, ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'

import { TextField } from '@design-system'
import type { TextFieldStatusProps } from '@design-system'

import type { ProofSuggestion } from '@/services/activities'
import type { RatioUnit } from '@/services/rules'
import { getQuantityText, maskBrDate } from '@/utils/activity-form'
import type { ActivityFormInput, ActivityFormOutput } from '@/utils/activity-form'

import * as S from './styles'

type ActivityFieldsProps = {
  /** Unidade da razão do item escolhido. Decide o rótulo da quantidade. */
  unit: RatioUnit
  /**
   * O que a leitura trouxe. `null` quando a leitura falhou: os campos ficam sem selo, para o aluno
   * preencher à mão.
   */
  suggestion: ProofSuggestion | null
}

// Lido: pede conferência. Não lido: pede para digitar. Leitura falha: sem selo.
function statusOf(
  value: unknown,
  unreadMessage: string,
  hasSuggestion: boolean,
): TextFieldStatusProps {
  if (!hasSuggestion) return {}
  return value === null ? { status: 'unread', unreadMessage } : { status: 'read' }
}

/**
 * Mostra os campos de texto da atividade: nome, quantidade e as datas de início e fim.
 *
 * @remarks
 * Usado no registro e na correção. Lê o formulário pelo `useFormContext`, então precisa estar dentro
 * do `FormProvider` da tela, com o `ActivityFormSchema` de `@/utils/activity-form`. O que
 * veio da leitura ganha o selo "Lido do certificado, confira"; o que não veio ganha a frase do que
 * digitar. As datas recebem as barras enquanto a pessoa digita.
 */
export function ActivityFields({ unit, suggestion }: ActivityFieldsProps): ReactNode {
  const {
    register,
    formState: { errors },
  } = useFormContext<ActivityFormInput, unknown, ActivityFormOutput>()
  const quantityText = getQuantityText(unit)
  const hasSuggestion = suggestion !== null

  function dateField(field: 'startDate' | 'endDate') {
    const registered = register(field)

    return {
      ...registered,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        event.target.value = maskBrDate(event.target.value)
        return registered.onChange(event)
      },
    }
  }

  return (
    <S.Root>
      <TextField
        id="name"
        label="Nome da atividade"
        error={errors.name?.message}
        {...statusOf(
          suggestion?.name,
          'Não conseguimos ler o nome. Digite o nome da atividade, como está no certificado.',
          hasSuggestion,
        )}
        {...register('name')}
      />
      <TextField
        id="quantity"
        label={quantityText.label}
        inputMode="decimal"
        error={errors.quantity?.message}
        {...statusOf(suggestion?.quantity, quantityText.unreadMessage, hasSuggestion)}
        {...register('quantity')}
      />
      <TextField
        id="startDate"
        label="Data em que a atividade começou"
        inputMode="numeric"
        placeholder="dd/mm/aaaa"
        error={errors.startDate?.message}
        {...statusOf(
          suggestion?.startDate,
          'Não conseguimos ler a data. Digite a data em que a atividade começou.',
          hasSuggestion,
        )}
        {...dateField('startDate')}
      />
      <TextField
        id="endDate"
        label="Data em que a atividade terminou"
        inputMode="numeric"
        placeholder="dd/mm/aaaa"
        error={errors.endDate?.message}
        {...statusOf(
          suggestion?.endDate,
          'Não conseguimos ler a data. Digite a data em que a atividade terminou.',
          hasSuggestion,
        )}
        {...dateField('endDate')}
      />
    </S.Root>
  )
}
