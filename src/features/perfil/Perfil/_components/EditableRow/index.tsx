// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Contribuidores do SAACI (ver AUTHORS). Texto completo em LICENSE.

'use client'

import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

import { Button, Icon, Notice, TextField } from '@design-system'

import { invalidateAfterProfileWrite } from '@/services/profile'

import * as S from './styles'

export type EditableRowProps = {
  /** Nome do dado, usado na linha e como rótulo do campo ("Matrícula"). */
  label: string
  /** Valor que a linha mostra fechada ("2023104501" ou "Não informada"). */
  displayValue: string
  /** Texto que entra no campo ao abrir a edição, como a pessoa o digita ("2023.2"). */
  initialValue: string
  /** Regra do campo. Recebe o texto digitado e devolve o valor que `onSave` grava. */
  schema: v.GenericSchema<string, string | null>
  /** Regra do campo, escrita logo abaixo do rótulo. */
  hint?: string
  /** Frase de aviso mostrada enquanto a pessoa edita, antes de salvar (RF11, no semestre). */
  warning?: string
  /** Frase mostrada na linha depois de salvar, dizendo o que mudou. */
  successMessage: string
  /**
   * Frase mostrada no lugar de `successMessage` quando o valor salvo é `null`, isto é, quando a
   * pessoa apagou o dado. Sem ela, `successMessage` vale também para o campo apagado.
   */
  clearedMessage?: string
  /** Teclado do celular para o campo. */
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
  /** Exemplo dentro do campo vazio. */
  placeholder?: string
  /**
   * Grava o valor validado, normalmente com `updateProfile`. A linha chama a rotina
   * `invalidateAfterProfileWrite` depois, então `onSave` só grava.
   */
  onSave: (value: string | null) => Promise<unknown>
}

/**
 * Linha do cartão "Seus dados" que vira um formulário de um campo ao ser tocada.
 *
 * @remarks
 * Fechada, é um botão com o rótulo, o valor e a seta. Aberta, mostra o campo, o aviso opcional e os
 * botões Cancelar e Salvar. Salvar usa `useMutation` e derruba o cache pela rotina do domínio de
 * perfil. O que a pessoa digitou nunca é limpo depois de um erro (RNF24). O botão fica ocupado
 * também depois do sucesso, até a linha fechar, para não aceitar um segundo toque.
 *
 * @example
 * ```tsx
 * <EditableRow
 *   label="Matrícula"
 *   displayValue="2023104501"
 *   initialValue="2023104501"
 *   schema={EnrollmentFormSchema}
 *   successMessage="Matrícula salva. Ela já entra no seu formulário."
 *   onSave={(enrollmentId) => updateProfile({ enrollmentId })}
 * />
 * ```
 */
export function EditableRow({
  label,
  displayValue,
  initialValue,
  schema,
  hint,
  warning,
  successMessage,
  clearedMessage,
  inputMode,
  placeholder,
  onSave,
}: EditableRowProps): ReactNode {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  // A frase do último salvamento. `null` enquanto nada foi salvo desde que a linha abriu.
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ value: string }, unknown, { value: string | null }>({
    resolver: valibotResolver(v.object({ value: schema })),
    defaultValues: { value: initialValue },
  })

  const mutation = useMutation({
    mutationFn: ({ value }: { value: string | null }) => onSave(value),
    onSuccess: (_result, { value }) => {
      invalidateAfterProfileWrite(queryClient)
      setIsEditing(false)
      setSavedMessage(value === null && clearedMessage ? clearedMessage : successMessage)
    },
  })

  function open(): void {
    // O valor salvo pode ter mudado desde a última vez: o formulário só lê o padrão uma vez.
    reset({ value: initialValue })
    mutation.reset()
    setSavedMessage(null)
    setIsEditing(true)
  }

  if (!isEditing) {
    return (
      <S.Root>
        <S.ReadRow type="button" onClick={open}>
          <S.Label>{label}</S.Label>
          <S.Value>{displayValue}</S.Value>
          <S.Chevron>
            <Icon icon={ChevronRight} size="sm" />
          </S.Chevron>
        </S.ReadRow>
        {savedMessage ? (
          <S.Feedback>
            <Notice tone="success">{savedMessage}</Notice>
          </S.Feedback>
        ) : null}
      </S.Root>
    )
  }

  return (
    <S.Root>
      <S.Form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <TextField
          label={label}
          hint={hint}
          inputMode={inputMode}
          placeholder={placeholder}
          autoComplete="off"
          error={errors.value?.message}
          {...register('value')}
        />

        {warning ? <Notice tone="warning">{warning}</Notice> : null}

        {mutation.isError ? (
          <Notice tone="danger">
            Não conseguimos salvar agora. Confira sua internet e tente de novo. O que você digitou
            continua aqui.
          </Notice>
        ) : null}

        <S.Actions>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
            Cancelar
          </Button>
          <Button
            type="submit"
            busy={mutation.isPending || mutation.isSuccess}
            busyLabel="Salvando"
          >
            Salvar
          </Button>
        </S.Actions>
      </S.Form>
    </S.Root>
  )
}
